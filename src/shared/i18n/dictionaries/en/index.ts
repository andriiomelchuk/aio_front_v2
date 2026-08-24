
import { adminEn } from "./admin";
import { commonEn } from "./common";
import { siteEn } from "./site";

export const en = {
  ...commonEn,
  ...siteEn,
  ...adminEn,
} as const;