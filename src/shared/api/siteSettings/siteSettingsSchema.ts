import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(2048)]);
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(254)]);
const timezone = z.string().trim().min(1).max(100).refine((value) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}, "Invalid IANA timezone");

export const siteSettingsInputSchema = z.strictObject({
  general: z.strictObject({
    siteName: z.string().trim().min(1).max(100),
    siteDescription: z.string().max(500),
    logoUrl: optionalUrl,
  }),
  localization: z.strictObject({
    defaultLocale: z.enum(["uk", "en", "de", "ru"]),
    enabledLocales: z.array(z.enum(["uk", "en", "de", "ru"])).min(1),
    currency: z.enum(["UAH", "USD", "EUR", "GBP"]),
    timezone,
  }).refine((value) => value.enabledLocales.includes(value.defaultLocale), {
    message: "Default locale must be enabled",
    path: ["enabledLocales"],
  }),
  contact: z.strictObject({
    email: optionalEmail,
    phone: z.string().max(50),
    address: z.string().max(300),
    facebookUrl: optionalUrl,
    instagramUrl: optionalUrl,
  }),
  commerce: z.strictObject({
    lowStockThreshold: z.number().int().min(0).max(1_000_000),
    showOutOfStockProducts: z.boolean(),
    allowBackorders: z.boolean(),
    orderPrefix: z.string().trim().min(1).max(12).regex(/^[A-Za-z0-9_-]+$/),
  }),
  business: z.strictObject({
    mode: z.enum(["commerce", "services", "both"]),
  }),
  seo: z.strictObject({
    defaultTitle: z.string().trim().min(1).max(100),
    defaultDescription: z.string().max(500),
    keywords: z.string().max(500),
    socialImageUrl: optionalUrl,
  }),
  operations: z.strictObject({
    maintenanceMode: z.boolean(),
    emailNotifications: z.boolean(),
  }),
});

const auditEntrySchema = z.strictObject({
  id: z.string().min(1).max(100),
  action: z.enum(["update", "import", "reset"]),
  createdAt: z.string().datetime(),
  updatedBy: z.string().min(1).max(150),
});

export const siteSettingsImportSchema = siteSettingsInputSchema.extend({
  updatedAt: z.union([z.literal(""), z.string().datetime()]).optional(),
  updatedBy: z.string().max(150).optional(),
  changeLog: z.array(auditEntrySchema).max(50).optional(),
}).strict();
