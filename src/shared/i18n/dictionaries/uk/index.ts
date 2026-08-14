import type { T_Dictionary } from "../../types";

import { adminUk } from "./admin";
import { commonUk } from "./common";
import { siteUk} from "./site";

export const uk: T_Dictionary = {
  ...commonUk,
  ...siteUk,
  ...adminUk,
};