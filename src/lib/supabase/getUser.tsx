import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getUser(): Promise<User | null> {
  const client = await createClient();
  const response = await client.auth.getUser();
  return response.data.user;
}
