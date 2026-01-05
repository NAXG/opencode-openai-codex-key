# OpenCode 第三方 Codex API 插件

**使用第三方 Codex API 端点 + API Key 认证**

[![npm version](https://img.shields.io/npm/v/opencode-openai-codex-key.svg)](https://www.npmjs.com/package/opencode-openai-codex-key)

[English](./README.md) | 简体中文

---

## ✨ 功能特性

- ✅ **第三方 Codex API 支持** - 连接到任何兼容的 Codex API 端点
- ✅ **简单的 API Key 认证** - 无需 OAuth 流程
- ✅ **自定义 baseURL** - 配置您自己的 API 端点
- ✅ **完全兼容** - 使用 Codex Backend API 格式
- ✅ **所有模型支持** - GPT 5.1/5.2 Codex 所有变体
- ✅ **Prompt 缓存** - 跨请求复用响应
- ✅ **完整工具支持** - write, edit, bash, grep, glob 等
- ✅ **CODEX_MODE** - Codex-OpenCode 桥接提示（默认启用）

---

## 📦 安装

### For Humans

**选项 A：让 LLM 来做**

将以下内容粘贴到任何 LLM 代理（Claude Code、OpenCode、Cursor 等）：

```
安装 opencode-openai-codex-key 插件并配置我的第三方 Codex API，按照此文档操作：https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/main/README.zh.md
```

**选项 B：手动设置**

1. **添加插件到配置文件** (`~/.config/opencode/opencode.json`)：

   ```json
   {
     "plugin": ["opencode-openai-codex-key"]
   }
   ```

2. **运行认证：**

   ```bash
   opencode auth login
   ```

   选择：**OpenAI** → **"Third-party Codex API (API Key + URL)"**

   按提示输入：
   - **API Base URL**: `https://your-codex-api.com`
   - **API Key**: `sk-...`

3. **开始使用：**

   ```bash
   opencode run "write hello world to test.txt" --model=openai/gpt-5.1-codex-high
   ```

<details>
<summary><b>LLM 代理安装指南</b></summary>

### 分步说明

1. 编辑 OpenCode 配置文件：
   - Linux/Mac: `~/.config/opencode/opencode.json`
   - Windows: `%APPDATA%\opencode\opencode.json`

2. 将插件添加到 `plugin` 数组

3. 设置 `provider` 为 `"openai"` 并配置 baseURL

4. 根据您的 OpenCode 版本选择配置方式：
   - **现代配置 (OpenCode 1.0.140+)**: 使用 `variants` 使配置更简洁
   - **传统配置 (旧版本)**: 使用独立的模型定义

### 现代配置（推荐）

对于 OpenCode 1.0.140 及更高版本，从以下地址读取现代配置：

**配置文件地址**: https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/refs/heads/main/config/opencode-modern.json

此配置使用 `variants` 方式，提供更简洁、易维护的设置。主要特性：
- 使用 `variants` 定义模型变体（low/medium/high/xhigh）
- 支持所有 GPT 5.1/5.2 Codex 模型
- 包含正确的推理强度和摘要设置

**使用现代配置：**
```bash
opencode run "your prompt" --model=openai/gpt-5.2-codex-high
opencode run "your prompt" --model=openai/gpt-5.1-codex-medium
```

**重要提示**：使用前记得设置 `baseURL` 为您的第三方 Codex API 端点。

### 传统配置

对于旧版本的 OpenCode，从以下地址读取传统配置：

**配置文件地址**: https://raw.githubusercontent.com/NAXG/opencode-openai-codex-key/refs/heads/main/config/opencode-legacy.json

此配置为每个推理级别使用独立的模型定义。主要特性：
- 每个推理级别都是独立的模型（如 `gpt-5.2-codex-low`、`gpt-5.2-codex-high`）
- 兼容旧版本的 OpenCode
- 明确定义所有模型变体

**使用传统配置：**
```bash
opencode run "your prompt" --model=openai/gpt-5.2-codex-high
opencode run "your prompt" --model=openai/gpt-5.1-codex-high
```

**重要提示**：使用前记得设置 `baseURL` 为您的第三方 Codex API 端点。

### 运行认证

保存配置后：

```bash
opencode auth login
```

选择 **OpenAI** → **"Third-party Codex API (API Key + URL)"** 并输入您的凭据。

### 验证

```bash
opencode run "Hello" --model=openai/gpt-5.1-codex-high
```

</details>

---

## 🚀 快速开始

已经安装？以下是使用方法：

```bash
# 使用指定模型
opencode run "your prompt" --model=openai/gpt-5.1-codex-high

# 使用配置中的默认模型
opencode run "your prompt"

# 启用调试日志
ENABLE_PLUGIN_REQUEST_LOGGING=1 opencode run "your prompt"
```

日志保存到：`~/.opencode/logs/codex-plugin/`

---

## 📦 支持的模型

- **gpt-5.2** (none/low/medium/high/xhigh)
- **gpt-5.2-codex** (low/medium/high/xhigh)
- **gpt-5.1-codex-max** (low/medium/high/xhigh)
- **gpt-5.1-codex** (low/medium/high)
- **gpt-5.1-codex-mini** (medium/high)
- **gpt-5.1** (none/low/medium/high)

详见 `config/opencode-modern.json` 获取完整配置。

---

## 🧩 配置

### 方法一：交互式（推荐）

```bash
opencode auth login
# 按提示输入 baseURL 和 API Key
```

### 方法二：手动配置

创建或修改 `~/.config/opencode/opencode.json`：

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

然后运行：

```bash
opencode auth login
# 输入 API Key
```

---

## 📝 配置说明

### baseURL（必需）

指定您的第三方 Codex API 端点。可以通过以下方式配置：

1. **交互式提示**（推荐）：认证时输入
2. **插件配置文件**：`~/.opencode/openai-codex-auth-config.json`
3. **Provider 配置**：opencode.json 中的 `provider.openai.baseURL`

**优先级**: 插件配置 > Provider 配置 > 默认值

插件会自动将请求转换为：`https://your-base-url/backend-api/codex/responses`

### API 端点要求

您的第三方 Codex API 必须：

1. **端点路径**: `/backend-api/codex/responses`
2. **认证方式**: Bearer Token (`Authorization: Bearer YOUR_API_KEY`)
3. **请求格式**: Codex Backend API 格式
4. **响应格式**: SSE (Server-Sent Events)

---

## 🛠️ 工作原理

这个插件：

1. **拦截** OpenAI SDK 从 OpenCode 发出的请求
2. **重写** URL 到您的自定义 Codex API 端点
3. **转换** 请求为 Codex Backend API 格式
4. **注入** Codex 系统指令
5. **添加** API Key 认证头
6. **转换** SSE 响应回标准格式

---

## 📚 文档

- **详细设置指南**: `THIRD_PARTY_SETUP.md`
- **配置说明**: `docs/configuration.md`
- **故障排查**: `docs/troubleshooting.md`
- **架构文档**: `docs/development/ARCHITECTURE.md`

---

## ❓ 常见问题

**Q: 遇到 401 Unauthorized 错误？**
A: 检查您的 API key 是否正确。

**Q: 遇到 Connection refused 错误？**
A: 验证您的 baseURL 是否可访问。

**Q: 提示找不到模型？**
A: 确保使用 `openai/` 前缀（例如：`--model=openai/gpt-5-codex`）

**Q: baseURL 配置保存在哪里？**
A: `~/.opencode/openai-codex-auth-config.json`

---

## ⚠️ 注意事项

- 此功能用于连接到您自己的或授权的第三方 Codex API 端点
- 请确保您有权访问目标 API 端点
- 不同的 API 提供商可能有不同的使用限制和定价

---

## 📄 许可证

MIT License

## 🔗 原始项目

Modified from: [numman-ali/opencode-openai-codex-key](https://github.com/numman-ali/opencode-openai-codex-key)

---

**纯 API Key 版本 - 无 OAuth 依赖**
