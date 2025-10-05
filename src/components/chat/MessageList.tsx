"use client";

import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
          )}
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          {message.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
