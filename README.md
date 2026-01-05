# LangChain Browser Template

A Next.js project that runs AI Agents in the browser using LangChain.js, with support for directly registering tool functions in the frontend.

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Features

- ✅ Run LangChain Agent in the frontend (completely in the browser)
- ✅ Directly register tool functions in the frontend (can directly manipulate DOM)
- ✅ Backend only acts as API proxy (forwards requests and injects OpenAI API Key)
- ✅ Automatically opens modal when tools are called

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

At minimum, you need to configure `API_KEY`. Other environment variables have default values and can be adjusted as needed.

**Note:** If you need to locally override certain configurations, you can create a `.env.local` file (`.env.local` will override variables with the same name in `.env`).

For detailed instructions, please refer to `ENV_SETUP.md`.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage Examples

Enter the following in the dialog to test tool calls:

- "Help me open an info modal"
- "Show a confirmation dialog with title 'Confirm Delete' and content 'Are you sure you want to delete this item?'"
- "Open an input modal"

The Agent will recognize these requests and call the `open_modal` tool to open the corresponding modal on the page.

## Architecture

### Frontend

- **ChatInterface.tsx**: Main chat interface component
  - Creates and runs LangChain Agent in the browser
  - Directly registers frontend tool functions (`openModalTool`)
  - Tool functions can access React state and directly manipulate UI

### Backend

- **app/api/proxy/chat/completions/route.ts**: API proxy route
  - Receives OpenAI API requests from the frontend
  - Reads OpenAI API Key from environment variables
  - Forwards requests to OpenAI API
  - Supports streaming and non-streaming responses

## Tech Stack

- **Next.js 14**: React framework
- **LangChain.js**: Run AI Agent in the browser
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **OpenAI API**: Large language model

## Project Structure

```text
langchain-web-template/
├── app/
│   ├── api/
│   │   └── proxy/
│   │       └── chat/
│   │           └── completions/
│   │               └── route.ts   # API proxy route
│   ├── components/
│   │   ├── ChatInterface.tsx      # Chat interface (contains Agent logic)
│   │   └── CustomModal.tsx        # Modal component
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── package.json
├── tsconfig.json
└── next.config.js
```

## Custom Tools

You can add more frontend tools in `ChatInterface.tsx`. For example:

```typescript
const myCustomTool = new DynamicStructuredTool({
  name: "my_custom_tool",
  description: "Tool description",
  schema: z.object({
    // Define parameters
  }),
  func: async ({ param }) => {
    // Execute directly in the frontend, can manipulate DOM, call APIs, etc.
    return "Execution result";
  },
});
```

Then add the tool to the agent's tool list:

```typescript
const agent = await createAgent({
  model,
  tools: [openModalTool, myCustomTool], // Add your tools
});
```

## Notes

1. **API Key Security**: OpenAI API Key is stored in server-side environment variables and will not be leaked to the frontend
2. **Browser Compatibility**: LangChain.js requires modern browser support
3. **Cost Control**: All OpenAI API requests go through the backend proxy, making it easy to monitor and control costs

## License

MIT
