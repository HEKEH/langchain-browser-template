# 环境变量配置

## 使用 .env 文件

项目默认使用 `.env` 文件进行环境变量配置。

### 方式一：直接使用 .env 文件（推荐）

在项目根目录创建 `.env` 文件，添加以下内容：

```env
# ============================================
# 必需的环境变量
# ============================================

# API Key（必需）
API_KEY=your_openai_api_key_here

# ============================================
# 可选的环境变量
# ============================================

# OpenAI 模型名称（默认: gpt-4）
# 可选值: gpt-4, gpt-4-turbo-preview, gpt-3.5-turbo 等
NEXT_PUBLIC_MODEL=gpt-4

# OpenAI API 温度参数（默认: 0）
# 范围: 0-2，值越高输出越随机
NEXT_PUBLIC_TEMPERATURE=0

# 是否启用流式响应（默认: false）
# 设置为 true 启用流式响应（需要额外处理）
NEXT_PUBLIC_ENABLE_STREAMING=false

# Agent 是否启用详细日志（默认: false）
# 设置为 true 可以在浏览器控制台看到详细的 Agent 执行日志
NEXT_PUBLIC_AGENT_VERBOSE=false

# API 基础 URL（默认: https://api.openai.com）
# 如果使用代理或其他兼容的 OpenAI API 服务，可以修改此值
API_BASE_URL=https://api.openai.com
```

## 环境变量说明

### 必需变量

- **API_KEY**: OpenAI API 密钥，必须配置

### 前端变量（NEXT_PUBLIC_ 前缀）

这些变量会被暴露到浏览器端，可以安全地在前端代码中使用：

- **NEXT_PUBLIC_MODEL**: 使用的 OpenAI 模型名称
- **NEXT_PUBLIC_TEMPERATURE**: 模型温度参数（0-2）
- **NEXT_PUBLIC_ENABLE_STREAMING**: 是否启用流式响应
- **NEXT_PUBLIC_AGENT_VERBOSE**: 是否显示详细的 Agent 执行日志

### 后端变量

这些变量只在服务器端使用，不会被暴露到浏览器：

- **API_BASE_URL**: OpenAI API 的基础 URL，可用于使用代理服务

## 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录或注册账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件中

### 方式二：使用 .env.local 覆盖（可选）

如果你需要本地覆盖某些环境变量，可以创建 `.env.local` 文件。`.env.local` 会覆盖 `.env` 中的同名变量。

**注意：** `.env.local` 文件已在 `.gitignore` 中，不会被提交到版本控制，适合存储敏感的本地配置。

## 注意事项

- `.env` 文件**可以**被提交到版本控制（建议只包含示例值或非敏感配置）
- `.env.local` 文件已在 `.gitignore` 中，不会被提交到版本控制，适合存储敏感信息如 API Key
- **重要：** 如果你的 `.env` 包含真实的 API Key，请将其添加到 `.gitignore` 中，并使用 `.env.local` 存储敏感信息
- 确保 API Key 有足够的余额
- 以 `NEXT_PUBLIC_` 开头的变量会被暴露到浏览器，不要在这些变量中存储敏感信息
- 修改环境变量后需要重启开发服务器才能生效

