"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const pathname = usePathname();
  const isCommerceRoute = ["/products", "/categories", "/cart", "/wishlist", "/comparison", "/checkout"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isServicesRoute = pathname === "/services" || pathname.startsWith("/services/");

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

  if ((settings.business.mode === "services" && isCommerceRoute) || (settings.business.mode === "commerce" && isServicesRoute)) {
    return <div className="flex min-h-screen flex-col bg-background text-foreground"><Header /><main className="flex flex-1 items-center justify-center px-4"><section className="max-w-lg border-y border-border py-10 text-center"><h1 className="text-2xl font-bold">{t("site.moduleUnavailable.title")}</h1><p className="mt-3 text-muted">{t("site.moduleUnavailable.description")}</p><Link className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 font-medium text-background" href="/">{t("nav.home")}</Link></section></main><Footer /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
