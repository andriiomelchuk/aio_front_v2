import type { T_Dictionary } from "../../types";

import { adminRu } from "./admin";
import { commonRu } from "./common";
import { siteRu} from "./site";

export const ru: T_Dictionary = {
  ...commonRu,
  ...siteRu,
  ...adminRu,
};