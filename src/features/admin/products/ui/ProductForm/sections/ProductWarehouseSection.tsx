"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { T_Product, T_ProductVariant } from "@/entities/product/model/types";
import type { T_WarehouseState } from "@/entities/warehouse";
import { getWarehouseState } from "@/shared/api/warehouse";
import { useI18n } from "@/shared/i18n";
import { Input, Select, Switch } from "@/shared/ui";
import { ProductFormSection } from "../ProductFormSection";
import type { T_InitialStockPlacement } from "../types";
import type { T_ProductSectionProps } from "./types";

type T_ProductWarehouseSectionProps = Pick<T_ProductSectionProps, "sectionControl"> & {
  mode: "create" | "edit";
  product?: T_Product;
  variants?: T_ProductVariant[];
  initialPlacement?: T_InitialStockPlacement;
  onInitialPlacementChange: (placement?: T_InitialStockPlacement) => void;
};

const emptyState: T_WarehouseState = { warehouses: [], balances: [], movements: [] };
const getLocationValue = (warehouseId: string, locationId: string) => `${warehouseId}|${locationId}`;

export const ProductWarehouseSection = ({
  mode, product, variants, initialPlacement, onInitialPlacementChange, sectionControl,
}: T_ProductWarehouseSectionProps) => {
  const { t } = useI18n();
  const [state, setState] = useState(emptyState);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWarehouseState().then((warehouseState) => {
      if (!cancelled) setState(warehouseState);
    });
    return () => { cancelled = true; };
  }, []);

  const locations = state.warehouses
    .filter(({ status }) => status === "active")
    .flatMap((warehouse) => warehouse.locations.map((location) => ({
      value: getLocationValue(warehouse.id, location.id),
      label: `${warehouse.name} / ${location.name} (${location.code})`,
    })));
  const productBalances = useMemo(
    () => state.balances.filter((balance) => balance.productId === product?.id),
    [product?.id, state.balances],
  );
  const physical = productBalances.reduce((sum, balance) => sum + balance.physical, 0);
  const reserved = productBalances.reduce((sum, balance) => sum + balance.reserved, 0);
  const available = productBalances
    .filter(({ condition }) => condition === "sellable")
    .reduce((sum, balance) => sum + balance.physical - balance.reserved, 0);
  const unavailable = physical - available - reserved;

  const updatePlacement = (changes: Partial<T_InitialStockPlacement>) => {
    const current = initialPlacement ?? { warehouseId: "", locationId: "", quantity: 1, condition: "sellable" as const };
    onInitialPlacementChange({ ...current, ...changes });
  };

  return <ProductFormSection title={t("admin.product.form.sections.warehouse")} {...sectionControl}>
    {mode === "edit" && product ? <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          [t("admin.warehouse.summary.physical"), physical],
          [t("admin.warehouse.summary.reserved"), reserved],
          [t("admin.warehouse.summary.available"), available],
          [t("admin.product.form.warehouseUnavailable"), unavailable],
        ].map(([label, value]) => <div className="border border-border bg-background p-3" key={String(label)}><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold text-foreground">{value}</p></div>)}
      </div>
      <Link className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm text-foreground transition hover:bg-surface-muted sm:w-auto" href={`/admin/warehouse?productId=${encodeURIComponent(product.id)}`}>{t("admin.product.form.manageWarehouse")}</Link>
    </div> : <div className="space-y-4">
      <Switch
        label={t("admin.product.form.addInitialStock")}
        description={t("admin.product.form.addInitialStockDescription")}
        checked={isEnabled}
        disabled={!locations.length}
        onChange={(event) => {
          const enabled = event.target.checked;
          setIsEnabled(enabled);
          if (!enabled) onInitialPlacementChange(undefined);
          else updatePlacement({});
        }}
      />
      {!locations.length && <p className="text-sm text-warning">{t("admin.product.form.noWarehouseLocations")}</p>}
      {isEnabled && <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("admin.warehouse.fields.destination")}
          value={initialPlacement ? getLocationValue(initialPlacement.warehouseId, initialPlacement.locationId) : ""}
          onChange={(event) => { const [warehouseId, locationId] = event.target.value.split("|"); updatePlacement({ warehouseId, locationId }); }}
          options={[{ value: "", label: t("admin.warehouse.fields.selectLocation") }, ...locations]}
          required
        />
        {!!variants?.length && <Select label={t("admin.warehouse.fields.variant")} value={initialPlacement?.variantId ?? ""} onChange={(event) => updatePlacement({ variantId: event.target.value || undefined })} options={[{ value: "", label: t("admin.warehouse.fields.baseProduct") }, ...variants.map((variant) => ({ value: variant.id, label: `${variant.title} (${variant.sku})` }))]} />}
        <Input label={t("admin.warehouse.fields.quantity")} type="number" min="1" step="1" value={initialPlacement?.quantity ?? 1} onChange={(event) => updatePlacement({ quantity: Number(event.target.value) })} required />
        <Select label={t("admin.warehouse.fields.condition")} value={initialPlacement?.condition ?? "sellable"} onChange={(event) => updatePlacement({ condition: event.target.value as T_InitialStockPlacement["condition"] })} options={[{ value: "sellable", label: t("admin.warehouse.condition.sellable") }, { value: "quarantine", label: t("admin.warehouse.condition.quarantine") }, { value: "damaged", label: t("admin.warehouse.condition.damaged") }]} />
      </div>}
    </div>}
  </ProductFormSection>;
};
