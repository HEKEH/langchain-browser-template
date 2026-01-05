# LangChain Web Template

一个使用 LangChain.js 在浏览器中运行 AI Agent 的 Next.js 项目，支持在前端直接注册工具函数。

## 特性

- ✅ 前端运行 LangChain Agent（完全在浏览器中）
- ✅ 前端直接注册工具函数（可以直接操作 DOM）
- ✅ 后端仅作为 API 代理（转发请求并注入 OpenAI API Key）
- ✅ 工具调用时自动打开弹窗

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

至少需要配置 `API_KEY`。其他环境变量都有默认值，可根据需要调整。

**注意：** 如果你需要本地覆盖某些配置，可以创建 `.env.local` 文件（`.env.local` 会覆盖 `.env` 中的同名变量）。

详细说明请参考 `ENV_SETUP.md`。

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 使用示例

在对话框中输入以下内容来测试工具调用：

- "帮我打开一个信息弹窗"
- "显示一个确认对话框，标题是'确认删除'，内容是'你确定要删除这个项目吗？'"
- "打开一个输入弹窗"

Agent 会识别这些请求并调用 `open_modal` 工具，在页面上打开相应的弹窗。

## 架构说明

### 前端部分

- **ChatInterface.tsx**: 主聊天界面组件
  - 在浏览器中创建和运行 LangChain Agent
  - 直接注册前端工具函数（`openModalTool`）
  - 工具函数可以访问 React 状态，直接操作 UI

### 后端部分

- **app/api/proxy/route.ts**: API 代理路由
  - 接收前端发送的 OpenAI API 请求
  - 从环境变量读取 OpenAI API Key
  - 转发请求到 OpenAI API
  - 支持流式和非流式响应

## 技术栈

- **Next.js 14**: React 框架
- **LangChain.js**: 在浏览器中运行 AI Agent
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **OpenAI API**: 大语言模型

## 项目结构

```
langchain-web-template/
├── app/
│   ├── api/
│   │   └── proxy/
│   │       └── route.ts          # API 代理路由
│   ├── components/
│   │   ├── ChatInterface.tsx     # 聊天界面（包含 Agent 逻辑）
│   │   └── CustomModal.tsx       # 弹窗组件
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── package.json
├── tsconfig.json
└── next.config.js
```

## 自定义工具

你可以在 `ChatInterface.tsx` 中添加更多的前端工具。例如：

```typescript
const myCustomTool = new DynamicStructuredTool({
  name: "my_custom_tool",
  description: "工具描述",
  schema: z.object({
    // 定义参数
  }),
  func: async ({ param }) => {
    // 直接在前端执行，可以操作 DOM、调用 API 等
    return "执行结果";
  },
});
```

然后将工具添加到 agent 的工具列表中：

```typescript
const agent = await createOpenAIFunctionsAgent({
  llm: model,
  tools: [openModalTool, myCustomTool], // 添加你的工具
  prompt,
});
```

## 注意事项

1. **API Key 安全**: OpenAI API Key 存储在服务器端的环境变量中，不会泄露到前端
2. **浏览器兼容性**: LangChain.js 需要现代浏览器支持
3. **成本控制**: 所有 OpenAI API 请求都通过后端代理，方便监控和控制成本

## License

MIT

