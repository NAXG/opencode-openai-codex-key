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

## 🚀 Quick Start

### 1. Run Authentication

```bash
opencode auth login
```

### 2. Enter Configuration

Select: **OpenAI** → **"Third-party Codex API (API Key + URL)"**

Enter when prompted:
- **API Base URL**: `https://your-codex-api.com`
- **API Key**: `sk-...`

Configuration is automatically saved!

### 3. Start Using

```bash
opencode run "write hello world to test.txt" --model=openai/gpt-5.1-codex-high
```

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
  "plugin": ["opencode-openai-codex-key"],
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

## 🔧 Usage

```bash
# Use specific model
opencode run "your prompt" --model=openai/gpt-5.1-codex-high

# Use default model from config
opencode run "your prompt"

# Enable debug logging
ENABLE_PLUGIN_REQUEST_LOGGING=1 opencode run "your prompt"
```

Logs are saved to: `~/.opencode/logs/codex-plugin/`

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
