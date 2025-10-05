"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginFormState } from "./login-state";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function loginWithGoogle(): Promise<LoginFormState> {
  const client = await createClient();

  const origin = (await headers()).get("origin") || "";
  console.log(origin);

  const {
    error,
    data: { url },
  } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  if (url) {
    redirect(url);
  }

  return {
    message: "Failed to get OAuth URL",
  };
}
