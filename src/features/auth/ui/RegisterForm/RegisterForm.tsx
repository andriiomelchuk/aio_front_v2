"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthApiError } from "@/shared/api/auth";
import { useI18n } from "@/shared/i18n";
import { Button, Checkbox, Input, useToast } from "@/shared/ui";
import { useAuth } from "../../model/useAuth";
import { AuthFormShell } from "../AuthFormShell/AuthFormShell";

export const RegisterForm = () => {
  const { t } = useI18n();
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    if (password !== String(formData.get("confirmPassword") ?? "")) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password,
        marketingConsent: formData.get("marketingConsent") === "on",
      });
      showToast({ message: t("auth.notification.registered") });
      router.replace("/products");
    } catch (caughtError) {
      setError(
        caughtError instanceof AuthApiError && caughtError.code === "EMAIL_EXISTS"
          ? t("auth.error.emailExists")
          : t("auth.error.registrationFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormShell
      title={t("auth.register.title")}
      description={t("auth.register.description")}
      footerText={t("auth.register.hasAccount")}
      footerLinkLabel={t("auth.login.action")}
      footerHref="/login"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input required autoComplete="given-name" name="firstName" type="text" label={t("auth.field.firstName")} />
          <Input required autoComplete="family-name" name="lastName" type="text" label={t("auth.field.lastName")} />
        </div>
        <Input required autoComplete="email" name="email" type="email" label={t("auth.field.email")} />
        <Input required minLength={8} autoComplete="new-password" name="password" type="password" label={t("auth.field.password")} />
        <Input required minLength={8} autoComplete="new-password" name="confirmPassword" type="password" label={t("auth.field.confirmPassword")} />
        <Checkbox name="marketingConsent" label={t("auth.field.marketingConsent")} description={t("auth.field.marketingConsentDescription")} />
        {error && <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? t("auth.register.submitting") : t("auth.register.action")}
        </Button>
      </form>
    </AuthFormShell>
  );
};
