"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginFormSchema, LoginFormState } from "./login-state";
import { redirect } from "next/navigation";

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  console.log(formData);
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect("/");
}
