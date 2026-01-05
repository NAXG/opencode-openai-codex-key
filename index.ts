/**
 * OpenAI ChatGPT (Codex) OAuth Authentication Plugin for opencode
 *
 * COMPLIANCE NOTICE:
 * This plugin uses OpenAI's official OAuth authentication flow (the same method
 * used by OpenAI's official Codex CLI at https://github.com/openai/codex).
 *
 * INTENDED USE: Personal development and coding assistance with your own
 * ChatGPT Plus/Pro subscription.
 *
 * NOT INTENDED FOR: Commercial resale, multi-user services, high-volume
 * automated extraction, or any use that violates OpenAI's Terms of Service.
 *
 * Users are responsible for ensuring their usage complies with:
 * - OpenAI Terms of Use: https://openai.com/policies/terms-of-use/
 * - OpenAI Usage Policies: https://openai.com/policies/usage-policies/
 *
 * For production applications, use the OpenAI Platform API: https://platform.openai.com/
 *
 * @license MIT with Usage Disclaimer (see LICENSE file)
 * @author numman-ali
 * @repository https://github.com/numman-ali/opencode-openai-codex-key
 */

import type { Plugin, PluginInput } from "@opencode-ai/plugin";
import type { Auth } from "@opencode-ai/sdk";
import { getCodexMode, loadPluginConfig, savePluginConfig } from "./lib/config.js";
import {
	CODEX_BASE_URL,
	LOG_STAGES,
	OPENAI_HEADERS,
	PLUGIN_NAME,
	PROVIDER_ID,
} from "./lib/constants.js";
import { logRequest } from "./lib/logger.js";
import {
	extractRequestUrl,
	handleErrorResponse,
	handleSuccessResponse,
	rewriteUrlForCodex,
	transformRequestForCodex,
} from "./lib/request/fetch-helpers.js";
import type { UserConfig } from "./lib/types.js";

/**
 * Third-party Codex API Authentication Plugin for OpenCode
 *
 * This plugin enables OpenCode to use third-party Codex API endpoints
 * with API Key authentication and custom base URLs.
 *
 * Modified from: https://github.com/numman-ali/opencode-openai-codex-key
 *
 * @example
 * ```json
 * {
 *   "plugin": ["opencode-openai-codex-key"],
 *   "provider": {
 *     "openai": {
 *       "baseURL": "https://your-codex-api.com"
 *     }
 *   },
 *   "model": "openai/gpt-5-codex"
 * }
 * ```
 */
export const OpenAIAuthPlugin: Plugin = async ({ client }: PluginInput) => {
	return {
		auth: {
			provider: PROVIDER_ID,
			/**
			 * Loader function for third-party Codex API authentication
			 *
			 * This function:
			 * 1. Validates API key authentication
			 * 2. Loads custom baseURL from config or provider settings
			 * 3. Loads user configuration from opencode.json
			 * 4. Returns SDK configuration with custom fetch implementation
			 *
			 * @param getAuth - Function to retrieve current auth state
			 * @param provider - Provider configuration from opencode.json
			 * @returns SDK configuration object or empty object for unsupported auth
			 */
			async loader(getAuth: () => Promise<Auth>, provider: unknown) {
				const auth = await getAuth();

				// Only handle API key auth type
				if (auth.type !== "api") {
					console.error(`[${PLUGIN_NAME}] This plugin only supports API Key authentication`);
					return {};
				}

				// Extract user configuration (global + per-model options)
				const providerConfig = provider as
					| {
						options?: Record<string, unknown>;
						models?: UserConfig["models"];
						baseURL?: string;
					}
					| undefined;
				const userConfig: UserConfig = {
					global: providerConfig?.options || {},
					models: providerConfig?.models || {},
				};

				// Load plugin configuration and determine CODEX_MODE
				// Priority: CODEX_MODE env var > config file > default (true)
				const pluginConfig = loadPluginConfig();
				const codexMode = getCodexMode(pluginConfig);

				// Determine base URL for third-party API
				// Priority: plugin config > provider config > default
				const customBaseURL =
					pluginConfig.baseURL || providerConfig?.baseURL || CODEX_BASE_URL;

				const apiKey = auth.key;

				// Return SDK configuration
				return {
					apiKey: apiKey,
					baseURL: customBaseURL,
					/**
					 * Custom fetch implementation for third-party Codex API
					 *
					 * Handles:
					 * - URL rewriting for Codex backend
					 * - Request body transformation
					 * - API Key header injection
					 * - SSE to JSON conversion for non-streaming requests
					 * - Error handling and logging
					 *
					 * @param input - Request URL or Request object
					 * @param init - Request options
					 * @returns Response from Codex API
					 */
					async fetch(
						input: Request | string | URL,
						init?: RequestInit,
					): Promise<Response> {
						// Step 1: Extract and rewrite URL for Codex backend
						const originalUrl = extractRequestUrl(input);
						const url = rewriteUrlForCodex(originalUrl, customBaseURL);

						// Step 2: Transform request body with model-specific Codex instructions
						// Capture original stream value before transformation
						const originalBody = init?.body ? JSON.parse(init.body as string) : {};
						const isStreaming = originalBody.stream === true;

						const transformation = await transformRequestForCodex(
							init,
							url,
							userConfig,
							codexMode,
						);
						const requestInit = transformation?.updatedInit ?? init;

						// Step 3: Create headers with API Key authentication
						const headers = new Headers(requestInit?.headers);
						headers.set(OPENAI_HEADERS.AUTHORIZATION, `Bearer ${apiKey}`);
						headers.set(OPENAI_HEADERS.CONTENT_TYPE, "application/json");

						// Step 4: Make request to Codex API
						const response = await fetch(url, {
							...requestInit,
							headers,
						});

						// Step 5: Log response
						logRequest(LOG_STAGES.RESPONSE, {
							status: response.status,
							ok: response.ok,
							statusText: response.statusText,
							headers: Object.fromEntries(response.headers.entries()),
						});

						// Step 6: Handle error or success response
						if (!response.ok) {
							return await handleErrorResponse(response);
						}

						return await handleSuccessResponse(response, isStreaming);
					},
				};
			},
			methods: [
				{
					label: "Third-party Codex API (API Key + URL)",
					type: "api" as const,
					prompts: [
						{
							type: "text" as const,
							key: "baseURL",
							message: "Enter your Codex API base URL:",
							placeholder: "https://your-codex-api.com",
							validate: (value: string) => {
								try {
									new URL(value);
									return undefined;
								} catch {
									return "Please enter a valid URL";
								}
							},
						},
						{
							type: "text" as const,
							key: "key",
							message: "Enter your API Key:",
							placeholder: "sk-...",
						},
					],
					async authorize(inputs?: Record<string, string>) {
						if (!inputs?.baseURL || !inputs?.key) {
							return { type: "failed" as const };
						}

						const currentConfig = loadPluginConfig();
						savePluginConfig({
							...currentConfig,
							baseURL: inputs.baseURL,
						});

						console.log(`\n[${PLUGIN_NAME}] ✅ Configuration saved`);
						console.log(`  Base URL: ${inputs.baseURL}`);
						console.log(`  API Key: ${inputs.key.substring(0, 10)}...`);

						return {
							type: "success" as const,
							key: inputs.key,
						};
					},
				},
			],
		},
	};
};

export default OpenAIAuthPlugin;
