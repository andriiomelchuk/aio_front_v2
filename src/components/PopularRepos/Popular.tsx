"use client";

import { PopularLanguages as Languages } from "./PopularLanguages";
import { PopularCard } from "./PopularCard";
import type { T_Repo } from "./types";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";
import { useI18n } from "@/shared/i18n";

type Items = {
  items: T_Repo[];
};

export const Popular = ({ items }: Items) => {

  const { t } = useI18n();
  
  return (
    <>
      <PageHeader
        eyebrow={t("popular.eyebrow")}
        title={t("popular.title")}
        description={t("popular.description")}
      />
      <div className="mx-auto flex justify-center items-center">
        <Languages></Languages>
      </div>
      {items.length ? (
        <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <PopularCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {t("popular.emptyTitle")}
          </h2>

          <p className="mt-2 text-sm text-muted">
            {t("popular.emptyDescription")}
          </p>
        </div>
      )}
    </>
  );
};
