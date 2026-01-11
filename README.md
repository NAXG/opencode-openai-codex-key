# Third-party Codex API Plugin for OpenCode

**Use third-party Codex API endpoints with API Key authentication**

[![npm version](https://img.shields.io/npm/v/opencode-openai-codex-key.svg)](https://www.npmjs.com/package/opencode-openai-codex-key)

English | [简体中文](./README.zh.md)

---

## ✨ Features

- ✅ **Third-party Codex API Support** - Connect to any compatible Codex API endpoint
- ✅ **Simple API Key Authentication** - No OAuth flow required
- ✅ **Custom baseURL** - Configure your own API endpoint
- ✅ **Full Compatibility** - Uses Codex Backend API format
- ✅ **All Model Support** - GPT 5.1/5.2 Codex all variants
- ✅ **Prompt Caching** - Reuse responses across requests
- ✅ **Complete Tool Support** - write, edit, bash, grep, glob, etc.
- ✅ **CODEX_MODE** - Codex-OpenCode bridge prompts (enabled by default)

---

## 📦 Installation

### For Humans

**Option A: Let an LLM do it**

Paste this into any LLM agent (Claude Code, OpenCode, Cursor, etc.):

```
Install the opencode-openai-codex-key plugin and configure it with my third-party Codex API by following: https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/main/README.md
```

**Option B: Manual setup**

1. **Add the plugin to your config** (`~/.config/opencode/opencode.json`):

   ```json
   {
     "plugin": ["opencode-openai-codex-key@4.4.0"]
   }
   ```

2. **Authenticate:**

   ```bash
   opencode auth login
   ```

   Select: **OpenAI** → **"Third-party Codex API (API Key + URL)"**

   Enter when prompted:
   - **API Base URL**: `https://your-codex-api.com`
   - **API Key**: `sk-...`

3. **Use it:**

   ```bash
   opencode run "write hello world to test.txt" --model=openai/gpt-5.1-codex-high
   ```

<details>
<summary><b>Installation Guide for LLM Agents</b></summary>

### Step-by-Step Instructions

1. Edit the OpenCode configuration file:
   - Linux/Mac: `~/.config/opencode/opencode.json`
   - Windows: `%APPDATA%\opencode\opencode.json`

2. Add the plugin to the `plugin` array:
   ```json
   {
     "plugin": ["opencode-openai-codex-key@4.4.0"]
   }
   ```

3. Choose configuration style based on your OpenCode version and read the configuration from the corresponding URL

4. Merge the configuration into the user's `opencode.json` file, making sure to:
   - Keep the `"plugin": ["opencode-openai-codex-key@4.4.0"]` declaration
   - Include all the `provider.openai.models` from the configuration file
   - Keep the `provider.openai.options` settings

**Note**: The `baseURL` and API Key will be set later through the authentication process, which saves them to `~/.opencode/openai-codex-auth-config.json` automatically.

### Modern Configuration (Recommended)

For OpenCode version 1.0.140 and later:

**Configuration URL**: https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/refs/heads/main/config/opencode-modern.json

**Instructions:**
1. Read the complete configuration from the URL above
2. Merge it with the user's existing `opencode.json`
3. Ensure `"plugin": ["opencode-openai-codex-key@4.4.0"]` is included in the `plugin` array
4. Copy all the models and options from the configuration file

This configuration uses `variants` for a cleaner, more maintainable setup. Key features:
- Uses `variants` to define model variations (low/medium/high/xhigh)
- Supports all GPT 5.1/5.2 Codex models
- Includes proper reasoning effort and summary settings

**Usage with modern config:**
```bash
opencode run "your prompt" --model=openai/gpt-5.2-codex-high
opencode run "your prompt" --model=openai/gpt-5.1-codex-medium
```

### Legacy Configuration

For older OpenCode versions:

**Configuration URL**: https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/refs/heads/main/config/opencode-legacy.json

**Instructions:**
1. Read the complete configuration from the URL above
2. Merge it with the user's existing `opencode.json`
3. Ensure `"plugin": ["opencode-openai-codex-key@4.4.0"]` is included in the `plugin` array
4. Copy all the models and options from the configuration file

This configuration uses individual model definitions for each reasoning level. Key features:
- Each reasoning level is a separate model (e.g., `gpt-5.2-codex-low`, `gpt-5.2-codex-high`)
- Compatible with older OpenCode versions
- Includes all model variants explicitly defined

**Usage with legacy config:**
```bash
opencode run "your prompt" --model=openai/gpt-5.2-codex-high
opencode run "your prompt" --model=openai/gpt-5.1-codex-high
```

### Run Authentication

After saving the config, run authentication to set up your API endpoint and key:

```bash
opencode auth login
```

Select **OpenAI** → **"Third-party Codex API (API Key + URL)"** and enter:
- **API Base URL**: Your third-party Codex API endpoint (e.g., `https://your-codex-api.com`)
- **API Key**: Your API key (e.g., `sk-...`)

This will automatically save your credentials to `~/.opencode/openai-codex-auth-config.json`.

### Verification

```bash
opencode run "Hello" --model=openai/gpt-5.1-codex-high
```

</details>

---

## 🚀 Quick Start

Already installed? Here's how to use it:

```bash
# Use with specific model
opencode run "your prompt" --model=openai/gpt-5.1-codex-high

# Use default model from config
opencode run "your prompt"

# Enable debug logging
ENABLE_PLUGIN_REQUEST_LOGGING=1 opencode run "your prompt"
```

Logs are saved to: `~/.opencode/logs/codex-plugin/`

---

## 📦 Supported Models

- **gpt-5.2** (none/low/medium/high/xhigh)
- **gpt-5.2-codex** (low/medium/high/xhigh)
- **gpt-5.1-codex-max** (low/medium/high/xhigh)
- **gpt-5.1-codex** (low/medium/high)
- **gpt-5.1-codex-mini** (medium/high)
- **gpt-5.1** (none/low/medium/high)

See `config/opencode-modern.json` for complete configuration.

---

## 🧩 Configuration

### Method 1: Interactive (Recommended)

```bash
opencode auth login
# Enter baseURL and API Key when prompted
```

### Method 2: Manual Configuration

Create or modify `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-openai-codex-key@4.4.0"],
  "provider": {
    "openai": {
      "baseURL": "https://your-codex-api.com",
      "options": {
        "reasoningEffort": "medium",
        "reasoningSummary": "auto",
        "textVerbosity": "medium"
      },
      "models": {
        "gpt-5.1-codex-high": {
          "name": "GPT 5.1 Codex High",
          "limit": { "context": 272000, "output": 128000 },
          "modalities": { "input": ["text", "image"], "output": ["text"] },
          "options": {
            "reasoningEffort": "high"
          }
        }
      }
    }
  },
  "model": "openai/gpt-5.1-codex-high"
}
```

Then run:

```bash
opencode auth login
# Enter API Key
```

---

## 📝 Configuration Details

### baseURL (Required)

Specify your third-party Codex API endpoint. Can be configured via:

1. **Interactive Prompt** (Recommended): Enter during authentication
2. **Plugin Config File**: `~/.opencode/openai-codex-auth-config.json`
3. **Provider Config**: `provider.openai.baseURL` in opencode.json

**Priority**: Plugin config > Provider config > Default value

The plugin automatically transforms requests to: `https://your-base-url/backend-api/codex/responses`

### API Endpoint Requirements

Your third-party Codex API must:

1. **Endpoint Path**: `/backend-api/codex/responses`
2. **Authentication**: Bearer Token (`Authorization: Bearer YOUR_API_KEY`)
3. **Request Format**: Codex Backend API format
4. **Response Format**: SSE (Server-Sent Events)

---

## 🛠️ How It Works

This plugin:

1. **Intercepts** requests from OpenCode's OpenAI SDK
2. **Rewrites** URLs to your custom Codex API endpoint
3. **Transforms** requests to Codex Backend API format
4. **Injects** Codex system instructions
5. **Adds** API Key authentication headers
6. **Converts** SSE responses back to standard format

---

## 📚 Documentation

- **Detailed Setup Guide**: `THIRD_PARTY_SETUP.md`
- **Configuration**: `docs/configuration.md`
- **Troubleshooting**: `docs/troubleshooting.md`
- **Architecture**: `docs/development/ARCHITECTURE.md`

---

## ❓ FAQ

**Q: Getting 401 Unauthorized error?**
A: Check if your API key is correct.

**Q: Getting Connection refused error?**
A: Verify that your baseURL is accessible.

**Q: Model not found error?**
A: Make sure to use the `openai/` prefix (e.g., `--model=openai/gpt-5-codex`)

**Q: Where is baseURL configuration saved?**
A: `~/.opencode/openai-codex-auth-config.json`

---

## ⚠️ Notice

- This plugin is for connecting to your own or authorized third-party Codex API endpoints
- Please ensure you have permission to access the target API endpoint
- Different API providers may have different usage limits and pricing

---

## 📄 License

MIT License

## 🔗 Original Project

Modified from: [numman-ali/opencode-openai-codex-key](https://github.com/numman-ali/opencode-openai-codex-key)

---

**Pure API Key Version - No OAuth Dependencies**
