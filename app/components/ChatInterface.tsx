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

      // Create custom OpenAI client using our proxy
      // Note: API key is handled by the backend proxy, this is just a placeholder
      const model = new ChatOpenAI({
        modelName: process.env.NEXT_PUBLIC_MODEL!,
        temperature: parseFloat(process.env.NEXT_PUBLIC_TEMPERATURE || "0"),
        streaming: process.env.NEXT_PUBLIC_ENABLE_STREAMING === "true",
        configuration: {
          baseURL: typeof window !== "undefined"
            ? `${window.location.origin}/api/proxy`
            : "http://localhost:3000/api/proxy",
        },
        apiKey: "dummy-key", // Placeholder, not actually used, API key is in the backend proxy
      });

      // Register frontend tool - open modal
      const openModalTool = new DynamicStructuredTool({
        name: "open_modal",
        description: "Opens a modal in the user interface to display important information or collect user input. Use this tool when you need to show content to the user or get feedback.",
        schema: z.object({
          title: z.string().describe("The modal title"),
          content: z.string().describe("The content displayed in the modal"),
          type: z.enum(["info", "confirm", "input"]).describe("Modal type: info - information display, confirm - confirmation dialog, input - input dialog"),
        }),
        func: async ({ title, content, type }) => {
          // Execute directly in the frontend to open the modal
          setModal({
            isOpen: true,
            title,
            content,
            type,
          });
          return `Modal opened with title: ${title}`;
        },
      });

      // Create agent
      const agent = await createAgent({
        model,
        tools: [openModalTool],
      });

      // Build message array including system message
      const systemMsg = new SystemMessage("You are a helpful AI assistant. You can use tools to help users. When you need to display important information to the user or get user confirmation, you can use the open_modal tool to open a modal in the interface.");

      // Convert history messages to LangChain message format
      const langchainMessages = messages.map((msg) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      // Add current user message
      const currentUserMessage = new HumanMessage(userMessage.content);

      // Build complete message array: system message + history messages + current user message
      const allMessages = [systemMsg, ...langchainMessages, currentUserMessage];

      // Execute agent - pass in message array
      // According to LangChain documentation, the agent returned by createAgent can directly receive a message array
      const result = await agent.invoke({ messages: allMessages });

      // Extract text content from the result
      // result may be an AIMessage or an object containing a messages field
      let responseText = "Sorry, I didn't generate a response.";

      if (result && typeof result === "object") {
        // If result is an AIMessage
        if ("text" in result) {
          responseText = result.text as string;
        } else if ("content" in result) {
          responseText = typeof result.content === "string"
            ? result.content
            : String(result.content);
        } else if ("messages" in result && Array.isArray(result.messages)) {
          // If result contains a messages array, take the last AI message
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
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold mb-2">AI Agent Chat</h2>
            <p>Start chatting with the AI! Try saying: "Help me open an info modal"</p>
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
              <span className="inline-block animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => {
              console.log(e.target.value, 'e.target.value');
              setInput(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Modal */}
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

