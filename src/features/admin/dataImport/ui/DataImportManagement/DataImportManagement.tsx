"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import type { T_ImportHistoryItem, T_ImportMapping, T_ImportPreviewRow, T_ImportRawRow, T_ImportResult, T_ImportStrategy, T_ImportTarget } from "@/entities/dataImport";
import { useAdminAccess } from "@/features/auth";
import { createAutomaticMapping, createImportPreview, downloadImportErrors, executeImport, importFields, importTemplates, mapImportRow, parseImportFile, readImportHistory, readMappingPreset, saveImportHistory, saveMappingPreset } from "@/shared/api/dataImport";
import { useI18n } from "@/shared/i18n";
import { Button, Select } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";

const downloadTemplate = (target: T_ImportTarget) => {
  const url = URL.createObjectURL(new Blob([importTemplates[target]], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${target}-import-template.csv`; anchor.click(); URL.revokeObjectURL(url);
};

export const DataImportManagement = () => {
  const { t } = useI18n();
  const { canManage, session } = useAdminAccess();
  const inputRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<T_ImportTarget>("products");
  const [strategy, setStrategy] = useState<T_ImportStrategy>("upsert");
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<T_ImportRawRow[]>([]);
  const [mapping, setMapping] = useState<T_ImportMapping>({});
  const [preview, setPreview] = useState<T_ImportPreviewRow[]>([]);
  const [history, setHistory] = useState<T_ImportHistoryItem[]>(() => readImportHistory());
  const [result, setResult] = useState<T_ImportResult | null>(null);
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const headers = useMemo(() => rawRows.length ? Object.keys(rawRows[0]) : [], [rawRows]);

  const applyRows = async (rows: T_ImportRawRow[], name: string, nextTarget = target) => {
    if (!rows.length) throw new Error(t("admin.imports.error.emptyFile"));
    const preset = readMappingPreset(nextTarget);
    const automatic = createAutomaticMapping(Object.keys(rows[0]), nextTarget);
    const nextMapping = preset && Object.values(preset).every((header) => !header || header in rows[0]) ? preset : automatic;
    const mapped = rows.map((row) => mapImportRow(row, nextMapping));
    setRawRows(rows); setFileName(name); setMapping(nextMapping); setResult(null);
    setPreview(await createImportPreview(mapped, nextTarget, strategy));
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    setError(""); setIsWorking(true);
    try { await applyRows(await parseImportFile(file), file.name); }
    catch (caught) { setError(caught instanceof Error ? caught.message : t("admin.imports.error.parse")); }
    finally { setIsWorking(false); }
  };

  const rebuildPreview = async (nextMapping = mapping, nextStrategy = strategy) => {
    const mapped = rawRows.map((row) => mapImportRow(row, nextMapping));
    setPreview(await createImportPreview(mapped, target, nextStrategy));
  };

  const changeTarget = async (value: T_ImportTarget) => {
    setTarget(value); setResult(null);
    if (rawRows.length) await applyRows(rawRows, fileName, value);
  };

  const runImport = async () => {
    setError(""); setIsWorking(true);
    try {
      saveMappingPreset(target, mapping);
      const nextResult = await executeImport(preview, target, session?.displayName ?? session?.email ?? "Staff");
      const item: T_ImportHistoryItem = { ...nextResult, id: crypto.randomUUID(), target, fileName, createdAt: new Date().toISOString(), createdBy: session?.displayName ?? session?.email ?? "Staff" };
      saveImportHistory(item); setHistory(readImportHistory()); setResult(nextResult);
    } catch (caught) { setError(caught instanceof Error ? caught.message : t("admin.imports.error.execute")); }
    finally { setIsWorking(false); }
  };

  return <AdminPage title={t("admin.imports.title")} description={t("admin.imports.description")} actions={
    <Button variant="secondary" className="h-10" onClick={() => downloadTemplate(target)}><Download className="mr-2 inline h-4 w-4" />{t("admin.imports.downloadTemplate")}</Button>
  }>
    <div className="space-y-5">
      <AdminFormAlert message={error} />
      <AdminCard title={t("admin.imports.sourceTitle")} description={t("admin.imports.sourceDescription")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label={t("admin.imports.target")} value={target} onChange={(event) => void changeTarget(event.target.value as T_ImportTarget)} options={[
            { value: "products", label: t("admin.imports.target.products") }, { value: "categories", label: t("admin.imports.target.categories") }, { value: "warehouse", label: t("admin.imports.target.warehouse") },
          ]} />
          <Select label={t("admin.imports.strategy")} value={strategy} onChange={(event) => { const value = event.target.value as T_ImportStrategy; setStrategy(value); void rebuildPreview(mapping, value); }} options={[
            { value: "upsert", label: t("admin.imports.strategy.upsert") }, { value: "create", label: t("admin.imports.strategy.create") }, { value: "update", label: t("admin.imports.strategy.update") },
          ]} disabled={target === "warehouse"} />
        </div>
        <button type="button" className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-muted p-5 text-center transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void loadFile(event.dataTransfer.files[0]); }}>
          <FileSpreadsheet className="mb-3 h-8 w-8 text-accent" /><span className="font-medium text-foreground">{fileName || t("admin.imports.dropzone")}</span><span className="mt-1 text-sm text-muted">CSV, XLSX, JSON</span>
        </button>
        <input ref={inputRef} className="sr-only" type="file" accept=".csv,.xlsx,.json" onChange={(event) => void loadFile(event.target.files?.[0])} />
      </AdminCard>

      {rawRows.length > 0 && <AdminCard title={t("admin.imports.mappingTitle")} description={t("admin.imports.mappingDescription")}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {importFields[target].map((field) => <Select key={field.key} label={`${field.label}${field.required ? " *" : ""}`} value={mapping[field.key] ?? ""} onChange={(event) => { const next = { ...mapping, [field.key]: event.target.value }; setMapping(next); void rebuildPreview(next); }} options={[{ value: "", label: t("admin.imports.notMapped") }, ...headers.map((header) => ({ value: header, label: header }))]} />)}
        </div>
      </AdminCard>}

      {preview.length > 0 && <AdminCard title={t("admin.imports.previewTitle")} description={t("admin.imports.previewDescription", { count: preview.length })}>
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <span>{t("admin.imports.summary.create")}: <strong>{preview.filter((row) => row.action === "create").length}</strong></span>
          <span>{t("admin.imports.summary.update")}: <strong>{preview.filter((row) => row.action === "update").length}</strong></span>
          <span>{t("admin.imports.summary.skip")}: <strong>{preview.filter((row) => row.action === "skip").length}</strong></span>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr><th className="p-3">{t("admin.imports.row")}</th><th className="p-3">{t("admin.imports.action")}</th><th className="p-3">{t("admin.imports.identifier")}</th><th className="p-3">{t("admin.imports.errors")}</th></tr></thead><tbody>{preview.slice(0, 50).map((row) => <tr className="border-b border-border last:border-0" key={row.rowNumber}><td className="p-3">{row.rowNumber}</td><td className="p-3 font-medium">{t(`admin.imports.action.${row.action}`)}</td><td className="p-3">{String(row.values.sku ?? row.values.slug ?? "-")}</td><td className="p-3 text-danger">{row.errors.join("; ") || "-"}</td></tr>)}</tbody></table></div>
        {preview.length > 50 && <p className="mt-3 text-sm text-muted">{t("admin.imports.previewLimit")}</p>}
        <div className="mt-5 flex justify-end"><Button className="h-10" disabled={!canManage || isWorking || preview.every((row) => row.action === "skip")} onClick={() => void runImport()}><Upload className="mr-2 inline h-4 w-4" />{isWorking ? t("admin.imports.importing") : t("admin.imports.run")}</Button></div>
      </AdminCard>}

      {result && <AdminCard title={t("admin.imports.resultTitle")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(["created", "updated", "skipped", "failed"] as const).map((key) => <div className="border-l-2 border-accent pl-3" key={key}><span className="block text-sm text-muted">{t(key === "created" ? "admin.imports.summary.create" : key === "updated" ? "admin.imports.summary.update" : key === "skipped" ? "admin.imports.summary.skip" : "admin.imports.summary.failed")}</span><strong className="text-xl">{result[key]}</strong></div>)}</div>
        {result.errors.length > 0 && <Button variant="secondary" className="mt-4 h-10" onClick={() => downloadImportErrors(result)}><Download className="mr-2 inline h-4 w-4" />{t("admin.imports.downloadErrors")}</Button>}
      </AdminCard>}

      <AdminCard title={t("admin.imports.historyTitle")}>
        {history.length === 0 ? <p className="text-sm text-muted">{t("admin.imports.historyEmpty")}</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr><th className="p-3">{t("admin.imports.file")}</th><th className="p-3">{t("admin.imports.target")}</th><th className="p-3">{t("admin.imports.responsible")}</th><th className="p-3">{t("admin.imports.date")}</th><th className="p-3">{t("admin.imports.resultTitle")}</th></tr></thead><tbody>{history.map((item) => <tr className="border-b border-border last:border-0" key={item.id}><td className="p-3 font-medium">{item.fileName}</td><td className="p-3">{t(`admin.imports.target.${item.target}`)}</td><td className="p-3">{item.createdBy}</td><td className="p-3">{new Date(item.createdAt).toLocaleString()}</td><td className="p-3">+{item.created} / ~{item.updated} / !{item.failed}</td></tr>)}</tbody></table></div>}
      </AdminCard>
    </div>
  </AdminPage>;
};
