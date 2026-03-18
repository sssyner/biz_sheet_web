"use client";

import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AIチャット</h2>
      <ChatPanel />
    </div>
  );
}
