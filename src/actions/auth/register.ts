"use server";

import { createClient } from "@/lib/supabase/server";
import { RegisterFormSchema, RegisterFormState } from "./register-state";
import { redirect } from "next/navigation";

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validated = RegisterFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        display_name: validated.data.name,
        name: validated.data.name,
      },
    },
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect("/");
}
