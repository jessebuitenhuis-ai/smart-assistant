"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function logout() {
  const client = await createClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
  redirect("/");
}
