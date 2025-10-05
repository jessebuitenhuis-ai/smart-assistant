import { login } from "@/actions/auth/login";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm action={login} />;
}
