import type { T_Locale } from "@/shared/i18n";

export type T_ServiceStatus = "draft" | "active" | "archived";
export type T_ServicePriceType = "fixed" | "from";
export type T_AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type T_ServiceTranslation = {
  title: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  variantTitles: Record<string, string>;
  addOnTitles: Record<string, string>;
};

export type T_ServiceVariant = {
  id: string;
  title: string;
  price?: number;
  durationMinutes?: number;
};

export type T_ServiceAddOn = {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
};

export type T_ServiceMaterial = {
  id: string;
  itemType: "product" | "consumable";
  itemId: string;
  variantId?: string;
  quantity: number;
  warehouseId: string;
  locationId: string;
};

export type T_ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
};

export type T_Service = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  seo: { title: string; description: string; keywords: string[] };
  imageUrl: string;
  priceType: T_ServicePriceType;
  price: number;
  oldPrice?: number;
  currency: "UAH" | "USD" | "EUR" | "GBP";
  durationMinutes: number;
  preparationMinutes: number;
  cleanupMinutes: number;
  bookingIntervalMinutes: number;
  capacity: number;
  variants: T_ServiceVariant[];
  addOns: T_ServiceAddOn[];
  providerIds: string[];
  locationIds: string[];
  relatedProductIds: string[];
  materials: T_ServiceMaterial[];
  status: T_ServiceStatus;
  defaultLocale: T_Locale;
  translations: Partial<Record<T_Locale, T_ServiceTranslation>>;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type T_WorkingPeriod = { start: string; end: string };
export type T_BlockedSlot = { id: string; startAt: string; endAt: string; reason: string };
export type T_WeeklySchedule = {
  dayOfWeek: number;
  enabled: boolean;
  periods: T_WorkingPeriod[];
  breaks: T_WorkingPeriod[];
};

export type T_ServiceProvider = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  imageUrl: string;
  serviceIds: string[];
  locationIds: string[];
  schedule: T_WeeklySchedule[];
  blockedSlots: T_BlockedSlot[];
  status: "active" | "inactive";
};

export type T_ServiceLocation = {
  id: string;
  name: string;
  address: string;
  timezone: string;
  capacity: number;
  schedule: T_WeeklySchedule[];
  blockedSlots: T_BlockedSlot[];
  status: "active" | "inactive";
};

export type T_AppointmentStatusEntry = {
  status: T_AppointmentStatus;
  createdAt: string;
  createdBy: string;
  note?: string;
};

export type T_Appointment = {
  id: string;
  serviceId: string;
  variantId?: string;
  addOnIds: string[];
  providerId: string;
  locationId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startAt: string;
  endAt: string;
  timezone: string;
  totalPrice: number;
  currency: T_Service["currency"];
  status: T_AppointmentStatus;
  customerNote: string;
  adminNote: string;
  cancellationReason?: string;
  materialsConsumedAt?: string;
  statusHistory: T_AppointmentStatusEntry[];
  createdAt: string;
  updatedAt: string;
};

export type T_ServicesState = {
  categories: T_ServiceCategory[];
  services: T_Service[];
  providers: T_ServiceProvider[];
  locations: T_ServiceLocation[];
  appointments: T_Appointment[];
};

export type T_CreateAppointmentDto = Pick<T_Appointment,
  "serviceId" | "variantId" | "addOnIds" | "providerId" | "locationId" |
  "customerId" | "customerName" | "customerEmail" | "customerPhone" |
  "startAt" | "timezone" | "customerNote"
>;
