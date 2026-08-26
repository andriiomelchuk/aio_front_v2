

import type { T_I18nKey } from "../../types";
import { adminDe } from "./admin";
import { commonDe } from "./common";
import { siteDe } from "./site";

export const de = {
  ...commonDe,
  ...siteDe,
  ...adminDe,
} satisfies Record<T_I18nKey, string>;
