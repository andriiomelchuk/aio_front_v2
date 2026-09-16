"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, Search, Upload } from "lucide-react";
import { translationNamespaces, type T_TranslationNamespace, type T_TranslationValues, type T_TranslationWorkspace } from "@/entities/translation";
import { useAdminAccess } from "@/features/auth";
import { getTranslationWorkspace, importTranslationDraft, publishTranslations, saveTranslationDraft, TranslationsApiError, validateTranslationValues } from "@/shared/api/translations";
import { locales, useI18n, type T_Locale } from "@/shared/i18n";
import { Button, Input, Select, Textarea } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";

const PAGE_SIZE = 40;
type T_IssueFilter = "all" | "missing" | "invalid";
type T_Workspaces = Partial<Record<T_Locale, T_TranslationWorkspace>>;
type T_ValuesByLocale = Record<T_Locale, T_TranslationValues>;
type T_IssuesByLocale = Record<T_Locale, ReturnType<typeof validateTranslationValues>>;

const createEmptyValues = (): T_ValuesByLocale => ({ uk: {}, en: {}, de: {}, ru: {} });

const TranslationEntry = ({ translationKey, source, defaultLocale, values, issues, disabled, onChange }: {
  translationKey: string;
  source: string;
  defaultLocale: T_Locale;
  values: T_ValuesByLocale;
  issues: T_IssuesByLocale;
  disabled: boolean;
  onChange: (locale: T_Locale, key: string, value: string) => void;
}) => {
  const { t } = useI18n();
  const [locale, setLocale] = useState<T_Locale>(defaultLocale);
  const issue = issues[locale].find((item) => item.key === translationKey);

  return (
    <article className="grid gap-3 rounded-md border border-border p-3 lg:grid-cols-2">
      <div className="min-w-0">
        <code className="break-all text-xs text-accent">{translationKey}</code>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{source}</p>
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{t("admin.translations.valueLabel", { locale: locale.toUpperCase() })}</span>
          <Select
            id={`translation-locale-${translationKey}`}
            className="h-8 min-w-24 py-1"
            aria-label={t("admin.translations.entryLanguage")}
            value={locale}
            onChange={(event) => setLocale(event.target.value as T_Locale)}
            options={locales.map((value) => ({ value, label: `${value.toUpperCase()}${values[value][translationKey]?.trim() ? " +" : ""}` }))}
          />
        </div>
        <Textarea
          id={`translation-${locale}-${translationKey}`}
          aria-label={`${t("admin.translations.valueLabel", { locale: locale.toUpperCase() })}: ${translationKey}`}
          value={values[locale][translationKey] ?? ""}
          disabled={disabled}
          error={issue ? t(`admin.translations.issue.${issue.type}`) : undefined}
          onChange={(event) => onChange(locale, translationKey, event.target.value)}
        />
      </div>
    </article>
  );
};

export const TranslationsManagement = () => {
  const { t, locale: currentLocale, setLocale } = useI18n();
  const { session, canManage } = useAdminAccess();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [namespace, setNamespace] = useState<T_TranslationNamespace>("common");
  const [previewLocale, setPreviewLocale] = useState<T_Locale>(currentLocale);
  const [workspaces, setWorkspaces] = useState<T_Workspaces>({});
  const [valuesByLocale, setValuesByLocale] = useState<T_ValuesByLocale>(createEmptyValues);
  const [search, setSearch] = useState("");
  const [issueFilter, setIssueFilter] = useState<T_IssueFilter>("all");
  const [page, setPage] = useState(1);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all(locales.map((locale) => getTranslationWorkspace(locale, namespace)))
      .then((loaded) => {
        if (!active) return;
        setWorkspaces(Object.fromEntries(loaded.map((workspace) => [workspace.locale, workspace])));
        setValuesByLocale(Object.fromEntries(loaded.map((workspace) => [workspace.locale, workspace.draft])) as T_ValuesByLocale);
        setPage(1);
      })
      .catch(() => active && setError(t("admin.translations.error.load")));
    return () => { active = false; };
  }, [namespace, t]);

  const actor = { id: session?.id ?? "unknown", name: session?.displayName ?? "Unknown user" };
  const source = useMemo(() => workspaces.en?.source ?? {}, [workspaces.en]);
  const issuesByLocale = useMemo<T_IssuesByLocale>(() => ({
    uk: validateTranslationValues(namespace, valuesByLocale.uk),
    en: validateTranslationValues(namespace, valuesByLocale.en),
    de: validateTranslationValues(namespace, valuesByLocale.de),
    ru: validateTranslationValues(namespace, valuesByLocale.ru),
  }), [namespace, valuesByLocale]);
  const issueMaps = useMemo(() => Object.fromEntries(locales.map((locale) => [
    locale,
    new Map(issuesByLocale[locale].map((issue) => [issue.key, issue])),
  ])) as Record<T_Locale, Map<string, T_IssuesByLocale[T_Locale][number]>>, [issuesByLocale]);

  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return Object.entries(source).filter(([key, englishSource]) => {
      const translations = locales.map((locale) => valuesByLocale[locale][key] ?? "").join(" ");
      const keyIssues = locales.map((locale) => issueMaps[locale].get(key)).filter(Boolean);
      const matchesSearch = !query || `${key} ${englishSource} ${translations}`.toLowerCase().includes(query);
      const matchesIssue = issueFilter === "all" ||
        (issueFilter === "missing" && keyIssues.some((issue) => issue?.type === "missing")) ||
        (issueFilter === "invalid" && keyIssues.some((issue) => issue?.type === "placeholder"));
      return matchesSearch && matchesIssue;
    });
  }, [issueFilter, issueMaps, search, source, valuesByLocale]);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalCount = Object.keys(source).length;
  const totalIssues = locales.reduce((sum, locale) => sum + issuesByLocale[locale].length, 0);

  const updateValue = (locale: T_Locale, key: string, value: string) => {
    setValuesByLocale((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
    setMessage("");
  };

  const applyWorkspaces = (loaded: T_TranslationWorkspace[]) => {
    setWorkspaces(Object.fromEntries(loaded.map((workspace) => [workspace.locale, workspace])));
    setValuesByLocale(Object.fromEntries(loaded.map((workspace) => [workspace.locale, workspace.draft])) as T_ValuesByLocale);
  };

  const runAction = async (action: () => Promise<T_TranslationWorkspace[]>, success: string) => {
    setIsBusy(true); setError(""); setMessage("");
    try {
      applyWorkspaces(await action());
      setMessage(success);
    } catch (caught) {
      setError(caught instanceof TranslationsApiError && caught.code === "VALIDATION_FAILED"
        ? t("admin.translations.error.validation")
        : caught instanceof TranslationsApiError && caught.code === "UNKNOWN_KEY"
          ? t("admin.translations.error.unknownKey", { key: caught.message })
          : t("admin.translations.error.save"));
    } finally { setIsBusy(false); }
  };

  const saveDrafts = () => runAction(
    () => Promise.all(locales.map((locale) => saveTranslationDraft(locale, namespace, valuesByLocale[locale], actor))),
    t("admin.translations.success.saved"),
  );
  const publishAll = () => runAction(async () => {
    await Promise.all(locales.map((locale) => saveTranslationDraft(locale, namespace, valuesByLocale[locale], actor)));
    return Promise.all(locales.map((locale) => publishTranslations(locale, namespace, actor)));
  }, t("admin.translations.success.published"));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(valuesByLocale, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `translations-${namespace}.json`; anchor.click(); URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    setIsBusy(true); setError("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON");
      const imported = parsed as Partial<Record<T_Locale, unknown>>;
      const loaded = await Promise.all(locales.map((locale) => {
        const values = imported[locale];
        if (!values || typeof values !== "object" || Array.isArray(values)) throw new Error("Missing locale");
        return importTranslationDraft(locale, namespace, JSON.stringify(values), actor);
      }));
      applyWorkspaces(loaded); setMessage(t("admin.translations.success.imported"));
    } catch (caught) {
      setError(caught instanceof TranslationsApiError && caught.code === "UNKNOWN_KEY"
        ? t("admin.translations.error.unknownKey", { key: caught.message })
        : t("admin.translations.error.import"));
    } finally {
      setIsBusy(false); if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const history = Object.values(workspaces)
    .flatMap((workspace) => workspace?.history.map((entry) => ({ ...entry, locale: workspace.locale })) ?? [])
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  return <AdminPage title={t("admin.translations.title")} description={t("admin.translations.description")} actions={canManage ? <>
    <Button variant="secondary" className="inline-flex h-10 items-center justify-center gap-2" onClick={exportJson}><Download size={18} />{t("admin.translations.export")}</Button>
    <Button variant="secondary" className="inline-flex h-10 items-center justify-center gap-2" onClick={() => importInputRef.current?.click()}><Upload size={18} />{t("admin.translations.import")}</Button>
    <Button className="h-10" disabled={isBusy} onClick={() => void saveDrafts()}>{t("admin.translations.saveDraft")}</Button>
    <Button variant="success" className="h-10" disabled={isBusy || totalIssues > 0} onClick={() => void publishAll()}>{t("admin.translations.publish")}</Button>
    <input ref={importInputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file); }} />
  </> : undefined}>
    <div className="space-y-4">
      {(error || message) && <p role={error ? "alert" : "status"} className={`rounded-md border p-3 text-sm ${error ? "border-danger bg-danger-soft text-danger" : "border-accent bg-accent-soft text-foreground"}`}>{error || message}</p>}
      <AdminCard><div className="grid gap-4 md:grid-cols-3">
        <Select id="translation-namespace" label={t("admin.translations.namespace")} value={namespace} onChange={(event) => { setError(""); setNamespace(event.target.value as T_TranslationNamespace); }} options={translationNamespaces.map((value) => ({ value, label: t(`admin.translations.namespace.${value}`) }))} />
        <Select id="translation-issues" label={t("admin.translations.filter")} value={issueFilter} onChange={(event) => { setIssueFilter(event.target.value as T_IssueFilter); setPage(1); }} options={(["all", "missing", "invalid"] as const).map((value) => ({ value, label: t(`admin.translations.filter.${value}`) }))} />
        <Input id="translation-search" type="search" label={t("admin.translations.search")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("admin.translations.searchPlaceholder")} />
      </div></AdminCard>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <AdminCard title={t("admin.translations.entries", { count: entries.length })} description={t("admin.translations.sourceHint")}>
          <div className="space-y-3">
            {pageEntries.map(([key, englishSource]) => <TranslationEntry key={key} translationKey={key} source={englishSource} defaultLocale={currentLocale} values={valuesByLocale} issues={issuesByLocale} disabled={!canManage} onChange={updateValue} />)}
            {pageEntries.length === 0 && <p className="py-8 text-center text-sm text-muted">{t("admin.translations.empty")}</p>}
          </div>
          {totalPages > 1 && <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm"><span>{t("pagination.pageOf", { page, totalPages })}</span><div className="flex gap-2"><Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{t("pagination.previous")}</Button><Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>{t("pagination.next")}</Button></div></div>}
        </AdminCard>
        <aside className="space-y-4">
          <AdminCard title={t("admin.translations.completeness")}>
            <div className="space-y-3">{locales.map((locale) => { const translated = Object.keys(source).filter((key) => valuesByLocale[locale][key]?.trim()).length; return <div key={locale}><div className="flex items-center justify-between text-sm"><strong>{locale.toUpperCase()}</strong><span>{totalCount ? Math.round((translated / totalCount) * 100) : 0}%</span></div><p className="text-xs text-muted">{t("admin.translations.translated", { translated, total: totalCount })}</p></div>; })}</div>
            <p className="mt-4 text-sm text-danger">{t("admin.translations.issueCount", { count: totalIssues })}</p>
          </AdminCard>
          <AdminCard title={t("admin.translations.preview")} description={t("admin.translations.previewDescription")}>
            <Select id="translation-preview-locale" label={t("admin.translations.language")} value={previewLocale} onChange={(event) => setPreviewLocale(event.target.value as T_Locale)} options={locales.map((value) => ({ value, label: t(`language.${value}`) }))} />
            <Button variant="secondary" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2" onClick={() => setLocale(previewLocale)}><Eye size={18} />{t("admin.translations.previewAction")}</Button>
            <div className="mt-3 rounded-md border border-border bg-background p-3"><Search size={18} /><p className="mt-2 text-sm text-foreground">{valuesByLocale[previewLocale][pageEntries[0]?.[0] ?? ""] || t("admin.translations.previewEmpty")}</p></div>
          </AdminCard>
          <AdminCard title={t("admin.translations.history")}><div className="space-y-3">
            {history.slice(0, 8).map((entry) => <div key={`${entry.locale}-${entry.id}`} className="border-b border-border pb-3 last:border-0"><p className="text-sm font-medium text-foreground">{entry.locale.toUpperCase()} · {t(`admin.translations.history.${entry.action}`)}</p><p className="text-xs text-muted">{entry.author.name} · {new Date(entry.createdAt).toLocaleString(currentLocale)}</p></div>)}
            {history.length === 0 && <p className="text-sm text-muted">{t("admin.translations.historyEmpty")}</p>}
          </div></AdminCard>
        </aside>
      </div>
    </div>
  </AdminPage>;
};
