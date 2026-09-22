import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/LoginForm";
import { PageLoading } from "@/shared/ui";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginForm />
    </Suspense>
  );
}
