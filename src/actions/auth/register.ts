"use server";

import { createClient } from "@/lib/supabase/server";
import { RegisterFormSchema, RegisterFormState } from "./register-state";

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const supabase = await createClient();

  const validated = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Registration logic here
  console.log("Register function called");
}
