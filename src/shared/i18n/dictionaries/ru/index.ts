import type { T_I18nKey } from "../../types";

import { adminRu } from "./admin";
import { commonRu } from "./common";
import { siteRu } from "./site";

export const ru = {
  ...commonRu,
  ...siteRu,
  ...adminRu,
} satisfies Record<T_I18nKey, string>;