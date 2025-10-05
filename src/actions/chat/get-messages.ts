"use server";

import { createClient } from "@/lib/supabase/server";
import { Message } from "@/types/chat";

export async function getMessages(
  threadId: string
): Promise<{ success: true; messages: Message[] } | { success: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // First verify the thread belongs to the user
  const { data: thread } = await supabase
    .from("threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .single();

  if (!thread) {
    return { success: false, error: "Thread not found or access denied" };
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, messages: data as Message[] };
}
