"use client";

import { useState, useRef, useEffect } from "react";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import CustomModal from "./CustomModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: string;
  type: "info" | "confirm" | "input";
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  console.log(input, 'input');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: "",
    type: "info",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {

      // 创建自定义的 OpenAI 客户端，使用我们的代理
      // 注意：API key 在后端代理中处理，这里只是占位符
      const model = new ChatOpenAI({
        modelName: process.env.NEXT_PUBLIC_MODEL!,
        temperature: parseFloat(process.env.NEXT_PUBLIC_TEMPERATURE || "0"),
        streaming: process.env.NEXT_PUBLIC_ENABLE_STREAMING === "true",
        configuration: {
          baseURL: typeof window !== "undefined"
            ? `${window.location.origin}/api/proxy`
            : "http://localhost:3000/api/proxy",
        },
        apiKey: "dummy-key", // 占位符，实际不会使用，API key 在后端代理中
      });

      // 注册前端工具 - 打开弹窗
      const openModalTool = new DynamicStructuredTool({
        name: "open_modal",
        description: "在用户界面打开一个弹窗，用于显示重要信息或收集用户输入。当需要向用户展示内容或获取反馈时使用此工具。",
        schema: z.object({
          title: z.string().describe("弹窗的标题"),
          content: z.string().describe("弹窗中显示的内容"),
          type: z.enum(["info", "confirm", "input"]).describe("弹窗类型：info-信息展示，confirm-确认对话框，input-输入对话框"),
        }),
        func: async ({ title, content, type }) => {
          // 直接在前端执行，打开弹窗
          setModal({
            isOpen: true,
            title,
            content,
            type,
          });
          return `弹窗已打开，标题：${title}`;
        },
      });

      // 创建 agent
      const agent = await createAgent({
        model,
        tools: [openModalTool],
      });

      // 构建消息数组，包含系统消息
      const systemMsg = new SystemMessage("你是一个有用的 AI 助手。你可以使用工具来帮助用户。当你需要向用户展示重要信息或获取用户确认时，可以使用 open_modal 工具在界面上打开弹窗。");

      // 将历史消息转换为 LangChain 消息格式
      const langchainMessages = messages.map((msg) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      // 添加当前用户消息
      const currentUserMessage = new HumanMessage(userMessage.content);

      // 构建完整的消息数组：系统消息 + 历史消息 + 当前用户消息
      const allMessages = [systemMsg, ...langchainMessages, currentUserMessage];

      // 执行 agent - 传入消息数组
      // 根据 LangChain 文档，createAgent 返回的 agent 可以直接传入消息数组
      const result = await agent.invoke({ messages: allMessages });

      // 从返回结果中提取文本内容
      // result 可能是 AIMessage 或包含 messages 字段的对象
      let responseText = "抱歉，我没有生成回复。";

      if (result && typeof result === "object") {
        // 如果 result 是 AIMessage
        if ("text" in result) {
          responseText = result.text as string;
        } else if ("content" in result) {
          responseText = typeof result.content === "string"
            ? result.content
            : String(result.content);
        } else if ("messages" in result && Array.isArray(result.messages)) {
          // 如果 result 包含 messages 数组，取最后一个 AI 消息
          const lastMessage = result.messages[result.messages.length - 1];
          if (lastMessage && "text" in lastMessage) {
            responseText = lastMessage.text as string;
          }
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `错误：${error instanceof Error ? error.message : "未知错误"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold mb-2">AI Agent 对话</h2>
            <p>开始与 AI 对话吧！试试说："帮我打开一个信息弹窗"</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow"
                }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow px-4 py-2 rounded-lg">
              <span className="inline-block animate-pulse">思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => {
              console.log(e.target.value, 'e.target.value');
              setInput(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
      </div>

      {/* 弹窗 */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        content={modal.content}
        type={modal.type}
      />
    </div>
  );
}

