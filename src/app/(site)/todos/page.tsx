"use client";

import { useI18n } from "@/shared/i18n";

export default function Todos() {
    const { t } = useI18n();

    return (
        <h1>{t("todos.title")}</h1>
    )
}
