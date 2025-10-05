import { ChatInterface } from "@/components/chat/ChatInterface";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

interface ChatThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify thread exists and belongs to user
  const { data: thread, error } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .single();

  if (error || !thread) {
    notFound();
  }

  return <ChatInterface threadId={threadId} threadTitle={thread.title} />;
}
