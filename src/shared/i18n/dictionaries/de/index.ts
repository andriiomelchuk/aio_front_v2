import type { T_Dictionary } from "../../types";

import { adminDe } from "./admin";
import { commonDe } from "./common";
import { siteDe} from "./site";

export const de: T_Dictionary = {
  ...commonDe,
  ...siteDe,
  ...adminDe,
};