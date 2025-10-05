"use server";

import { createClient } from "@/lib/supabase/server";
import { Thread } from "@/types/chat";

export async function createThread(
  title?: string
): Promise<{ success: true; thread: Thread } | { success: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("threads")
    .insert({
      user_id: user.id,
      title: title || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, thread: data as Thread };
}
