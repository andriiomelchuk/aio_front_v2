import type { T_Locale } from "@/shared/i18n";

export const translationNamespaces = ["common", "site", "admin"] as const;

export type T_TranslationNamespace = (typeof translationNamespaces)[number];
export type T_TranslationValues = Record<string, string>;
export type T_TranslationStatus = "draft" | "published";
export type T_TranslationHistoryAction = "saved" | "imported" | "published";

export type T_TranslationActor = {
  id: string;
  name: string;
};

export type T_TranslationHistoryEntry = {
  id: string;
  action: T_TranslationHistoryAction;
  createdAt: string;
  author: T_TranslationActor;
};

export type T_TranslationDocument = {
  locale: T_Locale;
  namespace: T_TranslationNamespace;
  status: T_TranslationStatus;
  draft: T_TranslationValues;
  published: T_TranslationValues;
  updatedAt: string;
  updatedBy: T_TranslationActor;
  history: T_TranslationHistoryEntry[];
};

export type T_TranslationValidationIssue = {
  key: string;
  type: "missing" | "placeholder";
  expectedPlaceholders: string[];
  actualPlaceholders: string[];
};

export type T_TranslationWorkspace = T_TranslationDocument & {
  source: T_TranslationValues;
  issues: T_TranslationValidationIssue[];
};
