"use client";

import { useState, type FormEvent } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type {
  T_CatalogSort,
  T_CatalogStock,
} from "@/features/catalog";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select, Switch } from "@/shared/ui";
import type { T_CatalogFiltersProps } from "./types";

export const CatalogFilters = ({
  params,
  categories,
  fixedCategory,
  onUpdate,
  onReset,
}: T_CatalogFiltersProps) => {
  const { t } = useI18n();
  const [draft, setDraft] = useState({
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate(draft);
  };

  const handleReset = () => {
    setDraft({ search: "", minPrice: "", maxPrice: "" });
    onReset();
  };

  const filters = (
    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
      {!fixedCategory && (
        <Select
          label={t("catalog.filter.category")}
          value={params.category}
          onChange={(event) => onUpdate({ category: event.target.value })}
          options={[
            { value: "", label: t("catalog.filter.allCategories") },
            ...categories
              .filter(({ status }) => status === "active")
              .map(({ slug, name }) => ({ value: slug, label: name })),
          ]}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("catalog.filter.minPrice")}
          type="number"
          min="0"
          inputMode="decimal"
          className="w-full"
          value={draft.minPrice}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              minPrice: event.target.value,
            }))
          }
        />
        <Input
          label={t("catalog.filter.maxPrice")}
          type="number"
          min="0"
          inputMode="decimal"
          className="w-full"
          value={draft.maxPrice}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              maxPrice: event.target.value,
            }))
          }
        />
      </div>

      <Select
        label={t("catalog.filter.stock")}
        value={params.stock}
        onChange={(event) =>
          onUpdate({ stock: event.target.value as T_CatalogStock })
        }
        options={[
          { value: "all", label: t("catalog.stock.all") },
          { value: "in_stock", label: t("products.stock.inStock") },
          { value: "low_stock", label: t("products.stock.lowStock") },
          { value: "out_of_stock", label: t("products.stock.outOfStock") },
        ]}
      />

      <Switch
        label={t("catalog.filter.discountOnly")}
        checked={params.discountOnly}
        onChange={(event) =>
          onUpdate({ discountOnly: event.target.checked })
        }
        className="h-full"
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-surface p-4"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto] md:items-end">
        <Input
          label={t("catalog.search.label")}
          type="search"
          placeholder={t("catalog.search.placeholder")}
          className="h-10 w-full"
          value={draft.search}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              search: event.target.value,
            }))
          }
        />
        <Select
          label={t("catalog.sort.label")}
          value={params.sort}
          onChange={(event) =>
            onUpdate({ sort: event.target.value as T_CatalogSort })
          }
          options={[
            { value: "name-asc", label: t("catalog.sort.nameAsc") },
            { value: "name-desc", label: t("catalog.sort.nameDesc") },
            { value: "price-asc", label: t("catalog.sort.priceAsc") },
            { value: "price-desc", label: t("catalog.sort.priceDesc") },
          ]}
        />
        <Button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 px-3"
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          {t("catalog.apply")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="inline-flex h-10 items-center justify-center gap-2 px-3"
          onClick={handleReset}
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          {t("catalog.reset")}
        </Button>
      </div>

      <details className="group mt-4 sm:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          {t("catalog.filters")}
        </summary>
        {filters}
      </details>

      <div className="hidden sm:block">{filters}</div>
    </form>
  );
};
