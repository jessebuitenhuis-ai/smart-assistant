"use server";

import { createClient } from "@/lib/supabase/server";
import { Message } from "@/types/chat";

export async function sendMessage(
  threadId: string,
  content: string
): Promise<{ success: true; message: Message } | { success: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the thread belongs to the user
  const { data: thread } = await supabase
    .from("threads")
    .select("id, title")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .single();

  if (!thread) {
    return { success: false, error: "Thread not found or access denied" };
  }

  // Insert user message
  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      role: "user",
      content,
    })
    .select()
    .single();

  if (userMessageError) {
    return { success: false, error: userMessageError.message };
  }

  // If thread has no title, generate one from the first message
  if (!thread.title) {
    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    await supabase
      .from("threads")
      .update({ title })
      .eq("id", threadId);
  }

  // TODO: Add AI response generation here
  // For now, just return a simple response
  const assistantContent = "This is a placeholder response. AI integration coming soon!";

  const { error: assistantMessageError } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      role: "assistant",
      content: assistantContent,
    })
    .select()
    .single();

  if (assistantMessageError) {
    return { success: false, error: assistantMessageError.message };
  }

  return { success: true, message: userMessage as Message };
}
