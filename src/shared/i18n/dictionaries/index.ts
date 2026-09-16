
import { de } from "./de";
import { en } from "./en";
import { ru } from "./ru";
import { uk } from "./uk";
import { adminDe } from "./de/admin";
import { commonDe } from "./de/common";
import { siteDe } from "./de/site";
import { adminEn } from "./en/admin";
import { commonEn } from "./en/common";
import { siteEn } from "./en/site";
import { adminRu } from "./ru/admin";
import { commonRu } from "./ru/common";
import { siteRu } from "./ru/site";
import { adminUk } from "./uk/admin";
import { commonUk } from "./uk/common";
import { siteUk } from "./uk/site";

export const dictionaries = {
  uk,
  en,
  de,
  ru,
};

export const dictionaryNamespaces = {
  en: { common: commonEn, site: siteEn, admin: adminEn },
  uk: { common: commonUk, site: siteUk, admin: adminUk },
  de: { common: commonDe, site: siteDe, admin: adminDe },
  ru: { common: commonRu, site: siteRu, admin: adminRu },
};
