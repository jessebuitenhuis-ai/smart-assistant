import { z } from "zod";

export const RegisterFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Invalid email address").trim(),
  password: z
    .string()
    .min(6, "Password should be at least 6 characters long")
    .trim(),
});

export type RegisterFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
