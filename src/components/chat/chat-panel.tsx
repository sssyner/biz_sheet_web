"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/types";

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<ChatMessage[]>("/api/chat/history")
      .then(setMessages)
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch<{ message: ChatMessage }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `エラー: ${msg}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">BizSheet AI</p>
              <p className="text-sm mt-1">
                売上分析、経費の傾向、経営アドバイスなど何でも聞いてください
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="animate-pulse text-gray-400 text-xs">...</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-gray-100"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
