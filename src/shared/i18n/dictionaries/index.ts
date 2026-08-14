import type { T_Dictionary, T_Locale } from "../types";

import { de } from "./de";
import { en } from "./en";
import { ru } from "./ru";
import { uk } from "./uk";

export const dictionaries: Record<T_Locale, T_Dictionary> = {
  uk,
  en,
  de,
  ru,
};