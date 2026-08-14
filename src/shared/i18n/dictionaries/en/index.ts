import type { T_Dictionary } from "../../types";

import { adminEn } from "./admin";
import { commonEn } from "./common";
import { siteEn } from "./site";

export const en: T_Dictionary = {
  ...commonEn,
  ...siteEn,
  ...adminEn,
};