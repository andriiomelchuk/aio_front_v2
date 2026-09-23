"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/shared/i18n";
import type { T_CategoryCardProps } from "./types";

export const CategoryCard = ({
  category,
  productCount,
  coverImage,
}: T_CategoryCardProps) => {
  const { t } = useI18n();

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={t("categories.imageAlt", { name: category.name })}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-5xl font-bold text-muted">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="line-clamp-2 min-h-7 text-lg font-semibold text-foreground">
          {category.name}
        </h2>
        {category.description ? (
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
            {category.description}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-muted">
          {t("categories.productCount", { count: productCount })}
        </p>
      </div>
    </Link>
  );
};
