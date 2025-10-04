"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginFormSchema, LoginFormState } from "./login-state";

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const supabase = await createClient();

  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Login logic here
  console.log("Login function called");
}
