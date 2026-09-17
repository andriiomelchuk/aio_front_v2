"use client";

import { Footer } from "../Footer";
import { Header } from "../Header";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  const settings = useSiteSettings();

  if (settings.operations.maintenanceMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <section className="w-full max-w-xl border-y border-border py-12 text-center">
          <p className="text-sm font-semibold uppercase text-accent">{settings.general.siteName}</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t("site.maintenanceTitle")}</h1>
          <p role="status" className="mt-4 leading-7 text-muted">{t("site.maintenanceMode")}</p>
          {settings.contact.email && <a href={`mailto:${settings.contact.email}`} className="mt-6 inline-flex font-semibold text-accent hover:underline">{settings.contact.email}</a>}
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
