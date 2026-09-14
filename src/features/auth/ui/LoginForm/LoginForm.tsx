"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApiError } from "@/shared/api/auth";
import { useI18n } from "@/shared/i18n";
import { Button, Input, useToast } from "@/shared/ui";
import { useAuth } from "../../model/useAuth";
import { AuthFormShell } from "../AuthFormShell/AuthFormShell";

const getSafeReturnPath = (value: string | null) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : "/products";

export const LoginForm = () => {
  const { t } = useI18n();
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      showToast({ message: t("auth.notification.loggedIn") });
      router.replace(getSafeReturnPath(searchParams.get("returnTo")));
    } catch (caughtError) {
      setError(
        caughtError instanceof AuthApiError && caughtError.code === "ACCOUNT_UNAVAILABLE"
          ? t("auth.error.accountUnavailable")
          : t("auth.error.invalidCredentials"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormShell
      title={t("auth.login.title")}
      description={t("auth.login.description")}
      footerText={t("auth.login.noAccount")}
      footerLinkLabel={t("auth.register.action")}
      footerHref="/register"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input required autoComplete="email" name="email" type="email" label={t("auth.field.email")} />
        <Input required minLength={8} autoComplete="current-password" name="password" type="password" label={t("auth.field.password")} />
        {error && <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.action")}
        </Button>
      </form>
    </AuthFormShell>
  );
};
