"use client";

import { useEffect, useMemo, useState } from "react";
import { getLocalizedText } from "@/entities/contentPage";
import type { T_MenuAssignmentTarget } from "@/entities/menu";
import { getCategories } from "@/shared/api/categories";
import { getContentPages } from "@/shared/api/contentPages";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { DataState, Input } from "@/shared/ui";

type T_TargetType = Exclude<T_MenuAssignmentTarget["type"], "global">;
type T_Option = { value: string; label: string; description: string };

export const MenuTargetSelector = ({ type, value, onChange }: { type: T_TargetType; value: string; onChange: (value: string) => void }) => {
  const { t, locale } = useI18n();
  const [options, setOptions] = useState<T_Option[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        if (type === "contentPage") {
          const pages = await getContentPages();
          setOptions(pages.map((page) => ({ value: page.id, label: getLocalizedText(page.title, locale, page.defaultLocale), description: `/${page.slug}` })));
        } else if (type === "category") {
          const categories = await getCategories();
          setOptions(categories.map((category) => ({ value: category.id, label: category.name, description: `/${category.slug}` })));
        } else {
          const products = await getProducts();
          setOptions(products.map((product) => ({ value: product.id, label: product.title, description: `${product.sku} · /products/${product.slug}` })));
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [locale, reloadKey, type]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? options.filter((option) => `${option.label} ${option.description}`.toLowerCase().includes(query)) : options;
  }, [options, search]);

  return <div className="min-w-0 md:col-span-2">
    <span className="mb-2 block text-sm font-medium text-foreground">{t("admin.menus.assignments.selectEntity")}</span>
    <Input className="h-10 w-full" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.menus.assignments.searchEntity")} />
    <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-border bg-background">
      {isLoading && <DataState compact variant="loading" title={t("admin.menus.assignments.loadingEntities")} />}
      {hasError && <DataState compact variant="error" description={t("admin.menus.assignments.entitiesLoadFailed")} onAction={() => setReloadKey((value) => value + 1)} />}
      {!isLoading && !hasError && filteredOptions.length === 0 && <DataState compact variant="empty" title={t("admin.menus.assignments.noEntities")} />}
      {!isLoading && !hasError && filteredOptions.map((option) => <label key={option.value} className="flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-surface-muted">
        <input type="radio" name="menu-assignment-target" className="mt-1 h-4 w-4 shrink-0 accent-accent" checked={value === option.value} onChange={() => onChange(option.value)} />
        <span className="min-w-0"><span className="block truncate text-sm font-medium text-foreground">{option.label}</span><span className="block truncate text-xs text-muted">{option.description} · {option.value}</span></span>
      </label>)}
    </div>
  </div>;
};
