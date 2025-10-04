import { z } from "zod";

export const RegisterFormSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z
    .string()
    .min(6, "Password should be at least 6 characters long")
    .trim(),
});

export type RegisterFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
