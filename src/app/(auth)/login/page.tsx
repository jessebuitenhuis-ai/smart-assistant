import { login } from "@/actions/auth/login";
import { loginWithGoogle } from "@/actions/auth/login-google";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm loginWithEmail={login} loginWithGoogle={loginWithGoogle} />;
}
