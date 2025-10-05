"use server";

import { createClient } from "@/lib/supabase/server";
import { RegisterFormSchema, RegisterFormState } from "./register-state";
import { redirect } from "next/navigation";

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validated = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(validated.data);

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect("/");
}
