"use client";

import { H1 } from "@/components/typography/h1";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createThread } from "@/actions/chat/create-thread";
import { useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateThread = async () => {
    setIsCreating(true);
    const result = await createThread();
    if (result.success) {
      router.push(`/chat/${result.thread.id}`);
    }
    setIsCreating(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <MessageCircleIcon className="h-24 w-24 text-muted-foreground" />
      <H1>Start a Conversation</H1>
      <p className="text-muted-foreground text-center max-w-md">
        Create a new chat thread to start talking with your AI assistant. Your conversations are saved and you can return to them anytime.
      </p>
      <Button onClick={handleCreateThread} disabled={isCreating} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </Button>
    </div>
  );
}
