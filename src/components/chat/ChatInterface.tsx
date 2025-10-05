"use client";

import { Message } from "@/types/chat";
import { useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { getMessages } from "@/actions/chat/get-messages";
import { sendMessage } from "@/actions/chat/send-message";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatInterfaceProps {
  threadId: string;
  threadTitle?: string;
}

export function ChatInterface({ threadId, threadTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getMessages(threadId);
    if (result.success) {
      setMessages(result.messages);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (content: string) => {
    const result = await sendMessage(threadId, content);
    if (result.success) {
      // Reload messages to get both user message and AI response
      await loadMessages();
    } else {
      setError(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-2/3 ml-auto" />
          <Skeleton className="h-16 w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          {threadTitle || "Chat"}
        </h2>
      </div>
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
