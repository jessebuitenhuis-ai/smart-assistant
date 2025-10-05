"use server";

import { createClient } from "@/lib/supabase/server";
import { Thread } from "@/types/chat";

export async function getThreads(
  limit: number = 10
): Promise<{ success: true; threads: Thread[] } | { success: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, threads: data as Thread[] };
}
