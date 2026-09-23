"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { T_Product } from "@/entities/product/model/types";
import type { T_InventoryItem, T_InventoryUnit, T_RecordInventoryMovementDto, T_WarehouseState } from "@/entities/warehouse";
import { useAdminAccess } from "@/features/auth";
import { getProducts } from "@/shared/api/products";
import { addWarehouseLocation, createInventoryItem, createWarehouse, getWarehouseState, recordInventoryMovement, seedWarehouseDemoData, setInventoryItemStatus, setWarehouseStatus, WarehouseApiError } from "@/shared/api/warehouse";
import { useI18n, type T_I18nKey } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";
import { Button, DataState, Input, Select } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

const initialState: T_WarehouseState = { warehouses: [], inventoryItems: [], balances: [], movements: [] };
const locationValue = (warehouseId: string, locationId: string) => `${warehouseId}|${locationId}`;
const parseLocation = (value: string) => {
  const [warehouseId, locationId] = value.split("|");
  return { warehouseId, locationId };
};
const movementTypes: Array<{ value: T_RecordInventoryMovementDto["type"]; label: T_I18nKey }> = [
  { value: "receipt", label: "admin.warehouse.movement.receipt" },
  { value: "write_off", label: "admin.warehouse.movement.write_off" },
  { value: "transfer", label: "admin.warehouse.movement.transfer" },
  { value: "adjustment", label: "admin.warehouse.movement.adjustment" },
  { value: "return", label: "admin.warehouse.movement.return" },
  { value: "damage", label: "admin.warehouse.movement.damage" },
  { value: "service_usage", label: "admin.warehouse.movement.service_usage" },
];
const movementLabelKeys: Record<T_WarehouseState["movements"][number]["type"], T_I18nKey> = {
  receipt: "admin.warehouse.movement.receipt", write_off: "admin.warehouse.movement.write_off",
  transfer: "admin.warehouse.movement.transfer", adjustment: "admin.warehouse.movement.adjustment",
  reservation: "admin.warehouse.movement.reservation", release: "admin.warehouse.movement.release",
  sale: "admin.warehouse.movement.sale", return: "admin.warehouse.movement.return",
  damage: "admin.warehouse.movement.damage",
  service_usage: "admin.warehouse.movement.service_usage",
};

const WarehouseProductLink = ({ product, productId, publicLabel }: { product?: T_Product; productId: string; publicLabel: string }) => {
  if (!product) return <span className="text-muted">{productId}</span>;
  return <span className="inline-flex items-center gap-2">
    <Link className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" href={`/admin/products/${product.id}/edit`}>
      {product.title}
    </Link>
    <Link className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" href={`/products/${product.slug}`} target="_blank" rel="noreferrer" aria-label={publicLabel} title={publicLabel}>
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
    </Link>
  </span>;
};

const WarehouseItemLabel = ({ product, item, itemId, publicLabel }: { product?: T_Product; item?: T_InventoryItem; itemId: string; publicLabel: string }) => {
  if (item) return <span><span className="font-medium text-foreground">{item.name}</span><span className="ml-2 text-xs text-muted">{item.sku} / {item.unit}</span></span>;
  return <WarehouseProductLink product={product} productId={itemId} publicLabel={publicLabel} />;
};

export const WarehouseManagement = () => {
  const { t } = useI18n();
  const { commerce } = useSiteSettings();
  const { canManage, session } = useAdminAccess();
  const [state, setState] = useState(initialState);
  const [products, setProducts] = useState<T_Product[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("productId") ?? "");
  const [warehouseForm, setWarehouseForm] = useState({ name: "", code: "", address: "", locationName: "", locationCode: "" });
  const [locationForm, setLocationForm] = useState({ warehouseId: "", name: "", code: "" });
  const [inventoryItemForm, setInventoryItemForm] = useState({ name: "", sku: "", unit: "piece" as T_InventoryUnit, lowStockThreshold: "0" });
  const [movement, setMovement] = useState({ type: "receipt", itemType: "product" as "product" | "consumable", productId: "", variantId: "", from: "", to: "", quantity: "", reason: "", reference: "", adjustmentDirection: "increase", condition: "sellable" });

  const reload = useCallback(async () => {
    const [warehouseState, productItems] = await Promise.all([getWarehouseState(), getProducts()]);
    setState(warehouseState); setProducts(productItems);
  }, []);
  useEffect(() => {
    let cancelled = false;
    Promise.all([getWarehouseState(), getProducts()]).then(async ([warehouseState, productItems]) => {
      const nextWarehouseState = warehouseState.warehouses.length ? warehouseState : await seedWarehouseDemoData();
      if (!cancelled) { setState(nextWarehouseState); setProducts(productItems); }
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const locationOptions = state.warehouses.filter(({ status }) => status === "active").flatMap((warehouse) =>
    warehouse.locations.map((location) => ({ value: locationValue(warehouse.id, location.id), label: `${warehouse.name} / ${location.name} (${location.code})` })),
  );
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const warehouseMap = useMemo(() => new Map(state.warehouses.map((warehouse) => [warehouse.id, warehouse])), [state.warehouses]);
  const inventoryItemMap = useMemo(() => new Map(state.inventoryItems.map((item) => [item.id, item])), [state.inventoryItems]);
  const balances = state.balances.filter((balance) => {
    const product = productMap.get(balance.productId);
    const inventoryItem = inventoryItemMap.get(balance.productId);
    const query = search.trim().toLocaleLowerCase();
    return !query || `${balance.productId} ${product?.title ?? ""} ${product?.sku ?? ""} ${inventoryItem?.name ?? ""} ${inventoryItem?.sku ?? ""}`.toLocaleLowerCase().includes(query);
  });
  const totals = state.balances.filter((balance) => (balance.itemType ?? "product") === "product").reduce((result, balance) => ({ physical: result.physical + balance.physical, reserved: result.reserved + balance.reserved, available: result.available + (balance.condition === "sellable" ? balance.physical - balance.reserved : 0) }), { physical: 0, reserved: 0, available: 0 });
  const lowStockConsumables = state.inventoryItems.filter((item) => {
    if (item.status !== "active") return false;
    const available = state.balances
      .filter((balance) => balance.itemType === "consumable" && balance.productId === item.id && balance.condition === "sellable")
      .reduce((sum, balance) => sum + balance.physical - balance.reserved, 0);
    return available <= item.lowStockThreshold;
  }).length;

  const run = async (action: () => Promise<unknown>, success: string) => {
    setError(""); setMessage("");
    try { await action(); await reload(); setMessage(success); return true; }
    catch (caughtError) { setError(caughtError instanceof WarehouseApiError ? caughtError.message : t("admin.warehouse.error.generic")); return false; }
  };

  const submitWarehouse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await run(() => createWarehouse(warehouseForm), t("admin.warehouse.success.warehouseCreated"))) setWarehouseForm({ name: "", code: "", address: "", locationName: "", locationCode: "" });
  };

  const submitLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await run(() => addWarehouseLocation(locationForm), t("admin.warehouse.success.locationCreated"))) setLocationForm({ warehouseId: "", name: "", code: "" });
  };

  const submitInventoryItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = { ...inventoryItemForm, lowStockThreshold: Number(inventoryItemForm.lowStockThreshold) };
    if (await run(() => createInventoryItem(input), t("admin.warehouse.success.inventoryItemCreated"))) {
      setInventoryItemForm({ name: "", sku: "", unit: "piece", lowStockThreshold: "0" });
    }
  };

  const submitMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    const source = parseLocation(movement.from);
    const destination = parseLocation(movement.to);
    const dto: T_RecordInventoryMovementDto = {
      type: movement.type as T_RecordInventoryMovementDto["type"], itemType: movement.itemType, productId: movement.productId,
      variantId: movement.variantId || undefined,
      quantity: Number(movement.quantity), reason: movement.reason, reference: movement.reference,
      adjustmentDirection: movement.adjustmentDirection as "increase" | "decrease",
      condition: movement.condition as T_RecordInventoryMovementDto["condition"],
      createdBy: session?.displayName ?? "Admin",
      ...(movement.from ? { fromWarehouseId: source.warehouseId, fromLocationId: source.locationId } : {}),
      ...(movement.to ? { toWarehouseId: destination.warehouseId, toLocationId: destination.locationId } : {}),
    };
    if (await run(() => recordInventoryMovement(dto), t("admin.warehouse.success.movementCreated"))) setMovement((current) => ({ ...current, quantity: "", reason: "", reference: "" }));
  };

  const needsSource = movement.type === "write_off" || movement.type === "transfer" || movement.type === "damage" || movement.type === "service_usage" || (movement.type === "adjustment" && movement.adjustmentDirection === "decrease");
  const needsDestination = movement.type === "receipt" || movement.type === "return" || movement.type === "transfer" || (movement.type === "adjustment" && movement.adjustmentDirection === "increase");
  const selectedProduct = movement.itemType === "product" ? productMap.get(movement.productId) : undefined;

  if (isLoading) return <DataState variant="loading" />;
  if (loadError) return <DataState variant="error" description={t("admin.warehouse.error.generic")} onAction={() => { setIsLoading(true); setLoadError(false); setReloadKey((value) => value + 1); }} />;

  return <AdminPage title={t("admin.warehouse.title")} description={t("admin.warehouse.description")}>
    <div className="space-y-4">
      <AdminFormAlert message={error} />
      {message && <p role="status" className="rounded-md border border-accent bg-accent/10 p-3 text-sm text-foreground">{message}</p>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(["physical", "reserved", "available"] as const).map((key) => <div key={key} className="border border-border bg-surface p-4"><p className="text-sm text-muted">{t(`admin.warehouse.summary.${key}`)}</p><p className="mt-2 text-2xl font-bold text-foreground">{totals[key]}</p></div>)}
        <div className="border border-border bg-surface p-4"><p className="text-sm text-muted">{t("admin.warehouse.summary.lowStockConsumables")}</p><p className="mt-2 text-2xl font-bold text-foreground">{lowStockConsumables}</p></div>
      </section>

      {canManage && <div className="grid items-start gap-4 xl:grid-cols-2 [&>section]:h-full">
        <AdminCard title={t("admin.warehouse.create.title")} description={t("admin.warehouse.create.description")}><form className="grid gap-4 sm:grid-cols-2" onSubmit={submitWarehouse}>
          <Input type="text" label={t("admin.warehouse.fields.name")} value={warehouseForm.name} onChange={(event) => setWarehouseForm({ ...warehouseForm, name: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.code")} value={warehouseForm.code} onChange={(event) => setWarehouseForm({ ...warehouseForm, code: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.address")} value={warehouseForm.address} onChange={(event) => setWarehouseForm({ ...warehouseForm, address: event.target.value })} />
          <Input type="text" label={t("admin.warehouse.fields.locationName")} value={warehouseForm.locationName} onChange={(event) => setWarehouseForm({ ...warehouseForm, locationName: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.locationCode")} value={warehouseForm.locationCode} onChange={(event) => setWarehouseForm({ ...warehouseForm, locationCode: event.target.value })} required />
          <Button type="submit" className="h-10 self-end sm:col-start-2">{t("admin.warehouse.actions.createWarehouse")}</Button>
        </form></AdminCard>

        <AdminCard title={t("admin.warehouse.consumables.title")} description={t("admin.warehouse.consumables.description")}><form className="grid gap-4 sm:grid-cols-2" onSubmit={submitInventoryItem}>
          <Input type="text" label={t("admin.warehouse.fields.itemName")} value={inventoryItemForm.name} onChange={(event) => setInventoryItemForm({ ...inventoryItemForm, name: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.sku")} value={inventoryItemForm.sku} onChange={(event) => setInventoryItemForm({ ...inventoryItemForm, sku: event.target.value })} required />
          <Select label={t("admin.warehouse.fields.unit")} value={inventoryItemForm.unit} onChange={(event) => setInventoryItemForm({ ...inventoryItemForm, unit: event.target.value as T_InventoryUnit })} options={(["piece", "ml", "l", "g", "kg"] as const).map((unit) => ({ value: unit, label: t(`admin.warehouse.unit.${unit}`) }))} />
          <Input type="number" min="0" step="any" label={t("admin.warehouse.fields.lowStockThreshold")} value={inventoryItemForm.lowStockThreshold} onChange={(event) => setInventoryItemForm({ ...inventoryItemForm, lowStockThreshold: event.target.value })} required />
          <Button type="submit" className="h-10 self-end sm:col-start-2">{t("admin.warehouse.actions.createInventoryItem")}</Button>
        </form></AdminCard>

        <AdminCard title={t("admin.warehouse.location.title")} description={t("admin.warehouse.location.description")}><form className="grid gap-4 sm:grid-cols-2" onSubmit={submitLocation}>
          <Select label={t("admin.warehouse.fields.warehouse")} value={locationForm.warehouseId} onChange={(event) => setLocationForm({ ...locationForm, warehouseId: event.target.value })} options={[{ value: "", label: t("admin.warehouse.fields.selectWarehouse") }, ...state.warehouses.map((warehouse) => ({ value: warehouse.id, label: `${warehouse.name} (${warehouse.code})` }))]} required />
          <Input type="text" label={t("admin.warehouse.fields.locationName")} value={locationForm.name} onChange={(event) => setLocationForm({ ...locationForm, name: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.locationCode")} value={locationForm.code} onChange={(event) => setLocationForm({ ...locationForm, code: event.target.value })} required />
          <Button type="submit" className="h-10 self-end sm:col-start-2" disabled={!state.warehouses.length}>{t("admin.warehouse.actions.addLocation")}</Button>
        </form></AdminCard>

        <div className="xl:col-span-2"><AdminCard title={t("admin.warehouse.movement.title")} description={t("admin.warehouse.movement.description")}><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submitMovement}>
          <Select label={t("admin.warehouse.fields.operation")} value={movement.type} onChange={(event) => setMovement({ ...movement, type: event.target.value, from: "", to: "" })} options={movementTypes.map(({ value, label }) => ({ value, label: t(label) }))} />
          <Select label={t("admin.warehouse.fields.stockItem")} value={movement.productId ? `${movement.itemType}|${movement.productId}` : ""} onChange={(event) => { const [itemType, productId] = event.target.value.split("|"); setMovement({ ...movement, itemType: itemType as "product" | "consumable", productId, variantId: "" }); }} options={[{ value: "", label: t("admin.warehouse.fields.selectStockItem") }, ...products.map((product) => ({ value: `product|${product.id}`, label: `${t("admin.warehouse.itemType.product")}: ${product.title} (${product.sku})` })), ...state.inventoryItems.filter(({ status }) => status === "active").map((item) => ({ value: `consumable|${item.id}`, label: `${t("admin.warehouse.itemType.consumable")}: ${item.name} (${item.sku})` }))]} required />
          {!!selectedProduct?.variants?.length && <Select label={t("admin.warehouse.fields.variant")} value={movement.variantId} onChange={(event) => setMovement({ ...movement, variantId: event.target.value })} options={[{ value: "", label: t("admin.warehouse.fields.baseProduct") }, ...selectedProduct.variants.map((variant) => ({ value: variant.id, label: `${variant.title} (${variant.sku})` }))]} />}
          {(movement.type === "receipt" || movement.type === "return" || movement.type === "write_off" || movement.type === "adjustment") && <Select label={t("admin.warehouse.fields.condition")} value={movement.condition} onChange={(event) => setMovement({ ...movement, condition: event.target.value })} options={[{ value: "sellable", label: t("admin.warehouse.condition.sellable") }, { value: "quarantine", label: t("admin.warehouse.condition.quarantine") }, { value: "damaged", label: t("admin.warehouse.condition.damaged") }]} />}
          {movement.type === "adjustment" && <Select label={t("admin.warehouse.fields.direction")} value={movement.adjustmentDirection} onChange={(event) => setMovement({ ...movement, adjustmentDirection: event.target.value, from: "", to: "" })} options={[{ value: "increase", label: t("admin.warehouse.direction.increase") }, { value: "decrease", label: t("admin.warehouse.direction.decrease") }]} />}
          {needsSource && <Select label={t("admin.warehouse.fields.source")} value={movement.from} onChange={(event) => setMovement({ ...movement, from: event.target.value })} options={[{ value: "", label: t("admin.warehouse.fields.selectLocation") }, ...locationOptions]} required />}
          {needsDestination && <Select label={t("admin.warehouse.fields.destination")} value={movement.to} onChange={(event) => setMovement({ ...movement, to: event.target.value })} options={[{ value: "", label: t("admin.warehouse.fields.selectLocation") }, ...locationOptions]} required />}
          <Input type="number" min="0.001" step="any" label={t("admin.warehouse.fields.quantity")} value={movement.quantity} onChange={(event) => setMovement({ ...movement, quantity: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.reason")} value={movement.reason} onChange={(event) => setMovement({ ...movement, reason: event.target.value })} required />
          <Input type="text" label={t("admin.warehouse.fields.reference")} value={movement.reference} onChange={(event) => setMovement({ ...movement, reference: event.target.value })} />
          <Button type="submit" className="h-10 self-end lg:col-start-3" disabled={!state.warehouses.length}>{t("admin.warehouse.actions.recordMovement")}</Button>
        </form></AdminCard></div>
      </div>}

      <AdminCard title={t("admin.warehouse.consumables.listTitle")} description={t("admin.warehouse.consumables.listDescription")}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.inventoryItems.map((item) => <article key={item.id} className="border border-border bg-background p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-foreground">{item.name}</h3><p className="text-sm text-muted">{item.sku} / {t(`admin.warehouse.unit.${item.unit}`)}</p></div><span className="text-xs text-muted">{t(`admin.warehouse.status.${item.status}`)}</span></div><p className="mt-3 text-sm text-muted">{t("admin.warehouse.consumables.lowStock", { count: item.lowStockThreshold })}</p>{canManage && <Button type="button" variant="secondary" className="mt-3 h-9 px-3 text-xs" onClick={() => void run(() => setInventoryItemStatus(item.id, item.status === "active" ? "inactive" : "active"), t("admin.warehouse.success.inventoryItemStatusChanged"))}>{t(item.status === "active" ? "admin.warehouse.actions.deactivate" : "admin.warehouse.actions.activate")}</Button>}</article>)}
        {!state.inventoryItems.length && <p className="text-sm text-muted">{t("admin.warehouse.consumables.empty")}</p>}
      </div></AdminCard>

      <AdminCard title={t("admin.warehouse.list.title")} description={t("admin.warehouse.list.description")}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.warehouses.map((warehouse) => <article key={warehouse.id} className="border border-border bg-background p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-foreground">{warehouse.name}</h3><p className="text-sm text-muted">{warehouse.code}{warehouse.address ? ` / ${warehouse.address}` : ""}</p></div><span className="text-xs text-muted">{t(`admin.warehouse.status.${warehouse.status}`)}</span></div><p className="mt-3 text-sm text-muted">{warehouse.locations.map((location) => `${location.name} (${location.code})`).join(", ")}</p>{canManage && <Button type="button" variant="secondary" className="mt-3 h-9 px-3 text-xs" onClick={() => void run(() => setWarehouseStatus(warehouse.id, warehouse.status === "active" ? "inactive" : "active"), t("admin.warehouse.success.statusChanged"))}>{t(warehouse.status === "active" ? "admin.warehouse.actions.deactivate" : "admin.warehouse.actions.activate")}</Button>}</article>)}
        {!state.warehouses.length && <p className="text-sm text-muted">{t("admin.warehouse.list.empty")}</p>}
      </div></AdminCard>

      <AdminCard title={t("admin.warehouse.balance.title")} description={t("admin.warehouse.balance.description")}><Input type="search" label={t("admin.warehouse.fields.search")} value={search} onChange={(event) => setSearch(event.target.value)} /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[860px] text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="px-3 py-2">{t("admin.warehouse.fields.stockItem")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.warehouse")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.condition")}</th><th className="px-3 py-2">{t("admin.warehouse.summary.physical")}</th><th className="px-3 py-2">{t("admin.warehouse.summary.reserved")}</th><th className="px-3 py-2">{t("admin.warehouse.summary.available")}</th></tr></thead><tbody>{balances.map((balance) => { const warehouse = warehouseMap.get(balance.warehouseId); const location = warehouse?.locations.find(({ id }) => id === balance.locationId); const isConsumable = (balance.itemType ?? "product") === "consumable"; const product = isConsumable ? undefined : productMap.get(balance.productId); const inventoryItem = isConsumable ? inventoryItemMap.get(balance.productId) : undefined; const available = balance.condition === "sellable" ? balance.physical - balance.reserved : 0; const threshold = inventoryItem?.lowStockThreshold ?? commerce.lowStockThreshold; return <tr key={`${balance.itemType ?? "product"}-${balance.productId}-${balance.variantId ?? "base"}-${balance.locationId}-${balance.condition}`} className={`border-b border-border ${balance.condition === "sellable" && available <= threshold ? "bg-warning/10" : ""}`}><td className="px-3 py-3"><WarehouseItemLabel product={product} item={inventoryItem} itemId={balance.productId} publicLabel={t("admin.warehouse.actions.openPublicProduct")} />{balance.variantId ? <span className="mt-1 block text-xs text-muted">{product?.variants?.find(({ id }) => id === balance.variantId)?.title ?? balance.variantId}</span> : null}</td><td className="px-3 py-3">{warehouse?.name} / {location?.name}</td><td className="px-3 py-3">{t(`admin.warehouse.condition.${balance.condition}`)}</td><td className="px-3 py-3">{balance.physical}</td><td className="px-3 py-3">{balance.reserved}</td><td className={`px-3 py-3 font-semibold ${balance.condition === "sellable" && available <= threshold ? "text-warning" : ""}`}>{available}</td></tr>; })}</tbody></table>{!balances.length && <p className="py-8 text-center text-sm text-muted">{t("admin.warehouse.balance.empty")}</p>}</div></AdminCard>

      <AdminCard title={t("admin.warehouse.history.title")} description={t("admin.warehouse.history.description")}><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="px-3 py-2">{t("admin.warehouse.fields.date")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.operation")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.stockItem")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.quantity")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.reason")}</th><th className="px-3 py-2">{t("admin.warehouse.fields.employee")}</th></tr></thead><tbody>{state.movements.slice(0, 50).map((item) => <tr key={item.id} className="border-b border-border"><td className="px-3 py-3">{new Date(item.createdAt).toLocaleString()}</td><td className="px-3 py-3">{t(movementLabelKeys[item.type])}</td><td className="px-3 py-3"><WarehouseItemLabel product={productMap.get(item.productId)} item={(item.itemType ?? "product") === "consumable" ? inventoryItemMap.get(item.productId) : undefined} itemId={item.productId} publicLabel={t("admin.warehouse.actions.openPublicProduct")} /></td><td className="px-3 py-3 font-semibold">{item.quantity}</td><td className="px-3 py-3">{item.reason}</td><td className="px-3 py-3">{item.createdBy}</td></tr>)}</tbody></table>{!state.movements.length && <p className="py-8 text-center text-sm text-muted">{t("admin.warehouse.history.empty")}</p>}</div></AdminCard>
    </div>
  </AdminPage>;
};
