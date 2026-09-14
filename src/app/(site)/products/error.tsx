"use client";

import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";

export default function ProductsError({ reset }: { reset: () => void }) {
  const { t } = useI18n();

  return (
    <main className="mx-auto grid w-full max-w-7xl place-items-center px-4 py-16 sm:px-6">
      <section className="w-full max-w-xl rounded-md border border-border bg-surface p-6 text-center sm:p-10">
        <h1 className="text-2xl font-bold">{t("catalog.errorTitle")}</h1>
        <p className="mt-3 text-muted">{t("catalog.errorDescription")}</p>
        <Button type="button" className="mt-6 h-11 px-5" onClick={reset}>
          {t("catalog.retry")}
        </Button>
      </section>
    </main>
  );
}
