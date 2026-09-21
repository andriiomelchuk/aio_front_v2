import { z } from "zod";

export const developerSettingsInputSchema = z.strictObject({
  modules: z.strictObject({
    dashboard: z.boolean(),
    users: z.boolean(),
    customers: z.boolean(),
    orders: z.boolean(),
    products: z.boolean(),
    categories: z.boolean(),
    pages: z.boolean(),
    menus: z.boolean(),
    translations: z.boolean(),
    analytics: z.boolean(),
    settings: z.boolean(),
    developerSettings: z.literal(true),
  }),
  diagnostics: z.strictObject({
    enabled: z.boolean(),
    showStorageUsage: z.boolean(),
  }),
});

const auditEntrySchema = z.strictObject({
  id: z.string().min(1).max(100),
  action: z.enum(["update", "import", "reset"]),
  createdAt: z.string().datetime(),
  updatedBy: z.string().min(1).max(150),
});

export const developerSettingsImportSchema = developerSettingsInputSchema.extend({
  updatedAt: z.union([z.literal(""), z.string().datetime()]).optional(),
  updatedBy: z.string().max(150).optional(),
  changeLog: z.array(auditEntrySchema).max(50).optional(),
}).strict();
