"use client";

import { useI18n } from "@/shared/i18n";

export default function Todos() {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("todos.title")}
        </h1>
      </header>
    </main>
  );
}
