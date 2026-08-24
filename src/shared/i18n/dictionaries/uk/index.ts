

import { T_I18nKey } from "../../types";
import { adminUk } from "./admin";
import { commonUk } from "./common";
import { siteUk } from "./site";

export const uk = {
  ...commonUk,
  ...siteUk,
  ...adminUk,
} satisfies Record<T_I18nKey, string>;