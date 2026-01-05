/**
 * Helper functions for the custom fetch implementation
 * These functions break down the complex fetch logic into manageable, testable units
 */


import { logRequest } from "../logger.js";
import { getCodexInstructions, getModelFamily } from "../prompts/codex.js";
import { transformRequestBody, normalizeModel } from "./request-transformer.js";
import { convertSseToJson, ensureContentType } from "./response-handler.js";
import type { UserConfig, RequestBody } from "../types.js";
import {
	PLUGIN_NAME,
	HTTP_STATUS,
	URL_PATHS,
	LOG_STAGES,
} from "../constants.js";

/**
 * Extracts URL string from various request input types
 * @param input - Request input (string, URL, or Request object)
 * @returns URL string
 */
export function extractRequestUrl(input: Request | string | URL): string {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return input.url;
}

/**
 * Rewrites OpenAI API URLs to Codex backend URLs
 * @param url - Original URL
 * @returns Rewritten URL for Codex backend
 */
/**
 * Rewrites URL from OpenAI SDK format to Codex backend format
 * For custom base URLs, uses the URL as-is without modification
 *
 * @param url - Original request URL
 * @param customBaseURL - Optional custom base URL (for third-party Codex API)
 * @returns URL for Codex backend
 *
 * @example
 * // Default ChatGPT backend
 * rewriteUrlForCodex("https://api.openai.com/v1/responses")
 * // => "https://api.openai.com/v1/codex/responses"
 *
 * // Custom base URL - uses original URL as-is
 * rewriteUrlForCodex("https://api.openai.com/v1/responses", "https://my-api.com")
 * // => "https://api.openai.com/v1/responses" (no modification)
 */
export function rewriteUrlForCodex(url: string, customBaseURL?: string): string {
	if (customBaseURL) {
		// For custom base URL, use it as-is without any path modification
		// User's URL should be the complete endpoint (e.g., https://your-api.com/v1/chat/completions)
		return url;
	}
	// For default ChatGPT backend, rewrite /responses to /codex/responses
	return url.replace(URL_PATHS.RESPONSES, URL_PATHS.CODEX_RESPONSES);
}

/**
 * Transforms request body and logs the transformation
 * Fetches model-specific Codex instructions based on the request model
 *
 * @param init - Request init options
 * @param url - Request URL
 * @param userConfig - User configuration
 * @param codexMode - Enable CODEX_MODE (bridge prompt instead of tool remap)
 * @returns Transformed body and updated init, or undefined if no body
 */
export async function transformRequestForCodex(
	init: RequestInit | undefined,
	url: string,
	userConfig: UserConfig,
	codexMode = true,
): Promise<{ body: RequestBody; updatedInit: RequestInit } | undefined> {
	if (!init?.body) return undefined;

	try {
		const body = JSON.parse(init.body as string) as RequestBody;
		const originalModel = body.model;

		// Normalize model first to determine which instructions to fetch
		// This ensures we get the correct model-specific prompt
		const normalizedModel = normalizeModel(originalModel);
		const modelFamily = getModelFamily(normalizedModel);

		// Log original request
		logRequest(LOG_STAGES.BEFORE_TRANSFORM, {
			url,
			originalModel,
			model: body.model,
			hasTools: !!body.tools,
			hasInput: !!body.input,
			inputLength: body.input?.length,
			codexMode,
			body: body as unknown as Record<string, unknown>,
		});

		// Fetch model-specific Codex instructions (cached per model family)
		const codexInstructions = await getCodexInstructions(normalizedModel);

		// Transform request body
		const transformedBody = await transformRequestBody(
			body,
			codexInstructions,
			userConfig,
			codexMode,
		);

		// Log transformed request
		logRequest(LOG_STAGES.AFTER_TRANSFORM, {
			url,
			originalModel,
			normalizedModel: transformedBody.model,
			modelFamily,
			hasTools: !!transformedBody.tools,
			hasInput: !!transformedBody.input,
			inputLength: transformedBody.input?.length,
			reasoning: transformedBody.reasoning as unknown,
			textVerbosity: transformedBody.text?.verbosity,
			include: transformedBody.include,
			body: transformedBody as unknown as Record<string, unknown>,
		});

		return {
			body: transformedBody,
			updatedInit: { ...init, body: JSON.stringify(transformedBody) },
		};
	} catch (e) {
		console.error(`[${PLUGIN_NAME}] Error parsing request:`, e);
		return undefined;
	}
}

/**
 * Creates headers for Codex API requests
 * @param init - Request init options
 * @param accountId - ChatGPT account ID
 * @param accessToken - OAuth access token
 * @returns Headers object with all required Codex headers
 */

/**
 * Handles error responses from the Codex API
 * @param response - Error response from API
 * @returns Original response or mapped retryable response
 */
export async function handleErrorResponse(
    response: Response,
): Promise<Response> {
	const mapped = await mapUsageLimit404(response);
	const finalResponse = mapped ?? response;

	logRequest(LOG_STAGES.ERROR_RESPONSE, {
		status: finalResponse.status,
		statusText: finalResponse.statusText,
	});

	return finalResponse;
}

/**
 * Handles successful responses from the Codex API
 * Converts SSE to JSON for non-streaming requests (generateText)
 * Passes through SSE for streaming requests (streamText)
 * @param response - Success response from API
 * @param isStreaming - Whether this is a streaming request (stream=true in body)
 * @returns Processed response (SSE→JSON for non-streaming, stream for streaming)
 */
export async function handleSuccessResponse(
    response: Response,
    isStreaming: boolean,
): Promise<Response> {
    const responseHeaders = ensureContentType(response.headers);

	// For non-streaming requests (generateText), convert SSE to JSON
	if (!isStreaming) {
		return await convertSseToJson(response, responseHeaders);
	}

	// For streaming requests (streamText), return stream as-is
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

async function mapUsageLimit404(response: Response): Promise<Response | null> {
	if (response.status !== HTTP_STATUS.NOT_FOUND) return null;

	const clone = response.clone();
	let text = "";
	try {
		text = await clone.text();
	} catch {
		text = "";
	}
	if (!text) return null;

	let code = "";
	try {
		const parsed = JSON.parse(text) as any;
		code = (parsed?.error?.code ?? parsed?.error?.type ?? "").toString();
	} catch {
		code = "";
	}

	const haystack = `${code} ${text}`.toLowerCase();
	if (!/usage_limit_reached|usage_not_included|rate_limit_exceeded|usage limit/i.test(haystack)) {
		return null;
	}

	const headers = new Headers(response.headers);
	return new Response(response.body, {
		status: HTTP_STATUS.TOO_MANY_REQUESTS,
		statusText: "Too Many Requests",
		headers,
	});
}
