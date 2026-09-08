
"use client";

import { useI18n } from "@/shared/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
   <main>{t("home.title")}</main>
  );
}
