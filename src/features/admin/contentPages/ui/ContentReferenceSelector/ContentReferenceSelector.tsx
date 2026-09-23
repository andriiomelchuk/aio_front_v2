"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategories } from "@/shared/api/categories";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { DataState, Input } from "@/shared/ui";
import type {
  T_ContentReferenceOption,
  T_ContentReferenceSelectorProps,
} from "./types";

export const ContentReferenceSelector = ({
  type,
  selectedValues,
  onChange,
}: T_ContentReferenceSelectorProps) => {
  const { t } = useI18n();
  const [options, setOptions] = useState<T_ContentReferenceOption[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        if (type === "products") {
          const products = await getProducts();
          setOptions(
            products.map((product) => ({
              value: product.id,
              label: product.title,
              description: `${product.sku} · ${product.id}`,
            })),
          );
        } else {
          const categories = await getCategories();
          setOptions(
            categories.map((category) => ({
              value: category.slug,
              label: category.name,
              description: `/${category.slug}`,
            })),
          );
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOptions();
  }, [reloadKey, type]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return options;

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedSearch) ||
        option.description?.toLowerCase().includes(normalizedSearch),
    );
  }, [options, search]);

  const toggleValue = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {type === "products"
            ? t("admin.contentPages.selector.products")
            : t("admin.contentPages.selector.categories")}
        </span>
        <span className="text-xs text-muted">
          {t("admin.contentPages.selector.selected", {
            count: selectedValues.length,
          })}
        </span>
      </div>

      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("admin.contentPages.selector.search")}
      />

      <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-border bg-background">
        {isLoading && (
          <DataState compact variant="loading" title={t("admin.contentPages.selector.loading")} />
        )}
        {hasError && (
          <DataState compact variant="error" description={t("admin.contentPages.selector.loadFailed")} onAction={() => setReloadKey((value) => value + 1)} />
        )}
        {!isLoading && !hasError && filteredOptions.length === 0 && (
          <DataState compact variant="empty" title={t("admin.contentPages.selector.empty")} />
        )}
        {!isLoading &&
          !hasError &&
          filteredOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-accent"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleValue(option.value)}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {option.label}
                </span>
                {option.description && (
                  <span className="block truncate text-xs text-muted">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          ))}
      </div>
    </div>
  );
};
