import {
  translationNamespaces,
  type T_TranslationActor,
  type T_TranslationDocument,
  type T_TranslationHistoryAction,
  type T_TranslationHistoryEntry,
  type T_TranslationNamespace,
  type T_TranslationValidationIssue,
  type T_TranslationValues,
  type T_TranslationWorkspace,
} from "@/entities/translation";
import { dictionaries, dictionaryNamespaces } from "@/shared/i18n/dictionaries";
import { locales, type T_Locale } from "@/shared/i18n/types";
import { TranslationsApiError } from "./types";

export const TRANSLATIONS_STORAGE_KEY = "aio-translations";
export const TRANSLATIONS_CHANGE_EVENT = "aio-translations-change";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getStorage = () =>
  typeof window === "undefined" ? undefined : window.localStorage;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isLocale = (value: unknown): value is T_Locale =>
  typeof value === "string" && locales.includes(value as T_Locale);

const isNamespace = (value: unknown): value is T_TranslationNamespace =>
  typeof value === "string" &&
  translationNamespaces.includes(value as T_TranslationNamespace);

const normalizeValues = (value: unknown): T_TranslationValues | undefined => {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value);
  if (!entries.every((entry): entry is [string, string] => typeof entry[1] === "string")) {
    return undefined;
  }
  return Object.fromEntries(entries);
};

const normalizeActor = (value: unknown): T_TranslationActor | undefined => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return undefined;
  }
  return { id: value.id, name: value.name };
};

const normalizeDocument = (value: unknown): T_TranslationDocument | undefined => {
  if (
    !isRecord(value) ||
    !isLocale(value.locale) ||
    !isNamespace(value.namespace) ||
    (value.status !== "draft" && value.status !== "published") ||
    typeof value.updatedAt !== "string" ||
    !Array.isArray(value.history)
  ) return undefined;

  const draft = normalizeValues(value.draft);
  const published = normalizeValues(value.published);
  const updatedBy = normalizeActor(value.updatedBy);
  if (!draft || !published || !updatedBy) return undefined;

  const history = value.history.flatMap<T_TranslationHistoryEntry>((entry) => {
    if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.createdAt !== "string") return [];
    if (entry.action !== "saved" && entry.action !== "imported" && entry.action !== "published") return [];
    const author = normalizeActor(entry.author);
    return author ? [{ id: entry.id, action: entry.action as T_TranslationHistoryAction, createdAt: entry.createdAt, author }] : [];
  });

  return {
    locale: value.locale,
    namespace: value.namespace,
    status: value.status,
    draft,
    published,
    updatedAt: value.updatedAt,
    updatedBy,
    history,
  };
};

const readDocuments = (): T_TranslationDocument[] => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(TRANSLATIONS_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeDocument).filter((item): item is T_TranslationDocument => Boolean(item));
  } catch {
    return [];
  }
};

const writeDocuments = (documents: T_TranslationDocument[]) => {
  const storage = getStorage();
  if (!storage) throw new TranslationsApiError("STORAGE_UNAVAILABLE", "Translation storage is unavailable");
  try {
    storage.setItem(TRANSLATIONS_STORAGE_KEY, JSON.stringify(documents));
    window.dispatchEvent(new Event(TRANSLATIONS_CHANGE_EVENT));
  } catch {
    throw new TranslationsApiError("STORAGE_WRITE_FAILED", "Could not save translations");
  }
};

const getSource = (namespace: T_TranslationNamespace): T_TranslationValues =>
  ({ ...dictionaryNamespaces.en[namespace] });

const getLocaleBase = (locale: T_Locale, namespace: T_TranslationNamespace): T_TranslationValues =>
  ({ ...dictionaryNamespaces[locale][namespace] });

export const getPlaceholders = (message: string) =>
  [...new Set(Array.from(message.matchAll(/\{([a-zA-Z0-9_]+)\}/g), (match) => match[1]))].sort();

export const validateTranslationValues = (
  namespace: T_TranslationNamespace,
  values: T_TranslationValues,
): T_TranslationValidationIssue[] => {
  const source = getSource(namespace);
  return Object.entries(source).reduce<T_TranslationValidationIssue[]>((issues, [key, sourceValue]) => {
    const value = values[key];
    if (!value?.trim()) {
      issues.push({ key, type: "missing", expectedPlaceholders: getPlaceholders(sourceValue), actualPlaceholders: [] });
      return issues;
    }
    const expectedPlaceholders = getPlaceholders(sourceValue);
    const actualPlaceholders = getPlaceholders(value);
    if (expectedPlaceholders.join("|") !== actualPlaceholders.join("|")) {
      issues.push({ key, type: "placeholder", expectedPlaceholders, actualPlaceholders });
    }
    return issues;
  }, []);
};

const createDocument = (
  locale: T_Locale,
  namespace: T_TranslationNamespace,
): T_TranslationDocument => ({
  locale,
  namespace,
  status: "published",
  draft: getLocaleBase(locale, namespace),
  published: {},
  updatedAt: "",
  updatedBy: { id: "system", name: "System" },
  history: [],
});

const withHistory = (
  document: T_TranslationDocument,
  action: T_TranslationHistoryAction,
  actor: T_TranslationActor,
) => {
  const updatedAt = new Date().toISOString();
  return {
    ...document,
    updatedAt,
    updatedBy: actor,
    history: [
      { id: createId(), action, createdAt: updatedAt, author: actor },
      ...document.history,
    ].slice(0, 30),
  };
};

const replaceDocument = (document: T_TranslationDocument) => {
  const documents = readDocuments().filter(
    (item) => item.locale !== document.locale || item.namespace !== document.namespace,
  );
  writeDocuments([...documents, document]);
};

export const getTranslationWorkspace = async (
  locale: T_Locale,
  namespace: T_TranslationNamespace,
): Promise<T_TranslationWorkspace> => {
  const document = readDocuments().find(
    (item) => item.locale === locale && item.namespace === namespace,
  ) ?? createDocument(locale, namespace);
  const source = getSource(namespace);
  const draft = { ...getLocaleBase(locale, namespace), ...document.draft };
  return { ...document, draft, source, issues: validateTranslationValues(namespace, draft) };
};

const assertKnownKeys = (namespace: T_TranslationNamespace, values: T_TranslationValues) => {
  const source = getSource(namespace);
  const unknownKey = Object.keys(values).find((key) => !(key in source));
  if (unknownKey) throw new TranslationsApiError("UNKNOWN_KEY", unknownKey);
};

export const saveTranslationDraft = async (
  locale: T_Locale,
  namespace: T_TranslationNamespace,
  values: T_TranslationValues,
  actor: T_TranslationActor,
  action: T_TranslationHistoryAction = "saved",
) => {
  assertKnownKeys(namespace, values);
  const current = await getTranslationWorkspace(locale, namespace);
  const document = withHistory({ ...current, status: "draft", draft: { ...values } }, action, actor);
  replaceDocument(document);
  return getTranslationWorkspace(locale, namespace);
};

export const publishTranslations = async (
  locale: T_Locale,
  namespace: T_TranslationNamespace,
  actor: T_TranslationActor,
) => {
  const current = await getTranslationWorkspace(locale, namespace);
  const issues = validateTranslationValues(namespace, current.draft);
  if (issues.length > 0) throw new TranslationsApiError("VALIDATION_FAILED", "Translations are incomplete");
  const base = getLocaleBase(locale, namespace);
  const published = Object.fromEntries(
    Object.entries(current.draft).filter(([key, value]) => value !== base[key]),
  );
  const document = withHistory({ ...current, status: "published", published }, "published", actor);
  replaceDocument(document);
  return getTranslationWorkspace(locale, namespace);
};

export const importTranslationDraft = async (
  locale: T_Locale,
  namespace: T_TranslationNamespace,
  json: string,
  actor: T_TranslationActor,
) => {
  try {
    const values = normalizeValues(JSON.parse(json));
    if (!values) throw new Error("Invalid translation object");
    assertKnownKeys(namespace, values);
    const current = await getTranslationWorkspace(locale, namespace);
    return saveTranslationDraft(locale, namespace, { ...current.draft, ...values }, actor, "imported");
  } catch (error) {
    if (error instanceof TranslationsApiError) throw error;
    throw new TranslationsApiError("INVALID_IMPORT", "Invalid translation JSON");
  }
};

export const getPublishedTranslationOverrides = (locale: T_Locale): T_TranslationValues => {
  const validKeys = dictionaries.en;
  return Object.assign(
    {},
    ...readDocuments()
      .filter((document) => document.locale === locale)
      .map((document) => Object.fromEntries(
        Object.entries(document.published).filter(([key, value]) => key in validKeys && value.trim()),
      )),
  );
};

export const getTranslationStorageSnapshot = () =>
  getStorage()?.getItem(TRANSLATIONS_STORAGE_KEY) ?? "";
