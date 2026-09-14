"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApiError } from "@/shared/api/auth";
import { useI18n } from "@/shared/i18n";
import { Button, Input } from "@/shared/ui";
import { useAuth } from "../../model/useAuth";

const getSafeAdminPath = (value: string | null) =>
  value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";

export const StaffLoginForm = () => {
  const { t } = useI18n();
  const { staffLogin } = useAuth();
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
      await staffLogin({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      router.replace(getSafeAdminPath(searchParams.get("returnTo")));
    } catch (caughtError) {
      setError(caughtError instanceof AuthApiError ? t("admin.auth.invalidCredentials") : t("admin.auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{t("admin.auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("admin.auth.loginDescription")}</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input required autoComplete="email" name="email" type="email" label={t("admin.auth.email")} />
          <Input required minLength={8} autoComplete="current-password" name="password" type="password" label={t("admin.auth.password")} />
          {error && <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? t("admin.auth.signingIn") : t("admin.auth.signIn")}
          </Button>
        </form>
      </section>
    </main>
  );
};
