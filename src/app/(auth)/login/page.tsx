import { login } from "@/actions/auth/login";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <LoginForm action={login} />;
}
