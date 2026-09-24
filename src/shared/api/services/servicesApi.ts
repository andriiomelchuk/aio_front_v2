import type { T_Appointment, T_CreateAppointmentDto, T_Service, T_ServicesState, T_WeeklySchedule } from "@/entities/service";
import type { T_SaveServiceCategoryDto, T_SaveServiceDto, T_SaveServiceLocationDto, T_SaveServiceProviderDto, T_ServicesApiContract, T_UpdateAppointmentDto } from "./types";
import { ServicesApiError } from "./types";
import { consumeServiceMaterials } from "@/shared/api/warehouse";

const STORAGE_KEY = "aio-services-state-v1";
export const SERVICES_CHANGE_EVENT = "aio-services-change";
const id = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
const schedule = (): T_WeeklySchedule[] => Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek, enabled: dayOfWeek > 0 && dayOfWeek < 6,
  periods: [{ start: "09:00", end: "18:00" }], breaks: [{ start: "13:00", end: "14:00" }],
}));

const seedState = (): T_ServicesState => {
  const locationId = "location-central";
  const providerId = "provider-anna";
  const serviceId = "service-consultation";
  const timestamp = now();
  return {
    categories: [{ id: "service-category-consultations", name: "Consultations", slug: "consultations", status: "active" }],
    locations: [{ id: locationId, name: "Central studio", address: "Main street 1", timezone: "Europe/Berlin", capacity: 2, schedule: schedule(), blockedSlots: [], status: "active" }],
    providers: [{ id: providerId, name: "Anna Meyer", email: "anna@example.com", phone: "+49 000 000000", bio: "Senior specialist", imageUrl: "", serviceIds: [serviceId], locationIds: [locationId], schedule: schedule(), blockedSlots: [], status: "active" }],
    services: [{
      id: serviceId, categoryId: "service-category-consultations", title: "Personal consultation", slug: "personal-consultation",
      shortDescription: "A focused one-to-one consultation.", description: "Discuss your needs and receive a tailored recommendation.", imageUrl: "",
      seo: { title: "Personal consultation", description: "Book a personal consultation.", keywords: ["consultation"] },
      priceType: "fixed", price: 50, currency: "EUR", durationMinutes: 60, preparationMinutes: 0, cleanupMinutes: 0,
      bookingIntervalMinutes: 30, capacity: 1, variants: [], addOns: [], providerIds: [providerId], locationIds: [locationId], relatedProductIds: [], materials: [],
      status: "active", defaultLocale: "en", translations: {}, createdAt: timestamp, updatedAt: timestamp, updatedBy: "System",
    }],
    appointments: [],
  };
};

const clone = <T>(value: T): T => structuredClone(value);
const normalizeState = (state: T_ServicesState): T_ServicesState => ({
  ...state,
  services: (state.services ?? []).map((service) => ({
    ...service,
    seo: service.seo ?? { title: service.title, description: service.shortDescription, keywords: [] },
    variants: service.variants ?? [], addOns: service.addOns ?? [], materials: service.materials ?? [], translations: Object.fromEntries(Object.entries(service.translations ?? {}).map(([locale, translation]) => [locale, {
      title: translation?.title ?? "", shortDescription: translation?.shortDescription ?? "", description: translation?.description ?? "",
      seoTitle: translation?.seoTitle ?? "", seoDescription: translation?.seoDescription ?? "",
      variantTitles: translation?.variantTitles ?? {}, addOnTitles: translation?.addOnTitles ?? {},
    }])),
  })),
  categories: state.categories ?? [],
  providers: (state.providers ?? []).map((item) => ({ ...item, schedule: item.schedule ?? schedule(), blockedSlots: item.blockedSlots ?? [] })),
  locations: (state.locations ?? []).map((item) => ({ ...item, schedule: item.schedule ?? schedule(), blockedSlots: item.blockedSlots ?? [] })),
  appointments: state.appointments ?? [],
});
const read = (): T_ServicesState => {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw) as T_ServicesState) : seedState();
  } catch { return seedState(); }
};
const persist = (state: T_ServicesState) => {
  if (typeof window === "undefined") throw new ServicesApiError("STORAGE_FAILED");
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); window.dispatchEvent(new Event(SERVICES_CHANGE_EVENT)); }
  catch { throw new ServicesApiError("STORAGE_FAILED"); }
};
const assertText = (value: string, field: string) => {
  if (!value.trim()) throw new ServicesApiError("INVALID_INPUT", `${field} is required`);
};
const toMinutes = (time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return Number.NaN;
  const hours = Number(match[1]); const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : Number.NaN;
};
const validateSchedule = (weeklySchedule: T_WeeklySchedule[], blockedSlots: { startAt: string; endAt: string; reason: string }[]) => {
  if (weeklySchedule.length !== 7 || new Set(weeklySchedule.map((day) => day.dayOfWeek)).size !== 7) throw new ServicesApiError("INVALID_INPUT", "Schedule must contain seven unique days");
  weeklySchedule.forEach((day) => {
    const periods = day.periods.map((period) => ({ start: toMinutes(period.start), end: toMinutes(period.end) })).sort((left, right) => left.start - right.start);
    const breaks = day.breaks.map((period) => ({ start: toMinutes(period.start), end: toMinutes(period.end) })).sort((left, right) => left.start - right.start);
    if (day.enabled && !periods.length) throw new ServicesApiError("INVALID_INPUT", "An enabled day needs a working period");
    if ([...periods, ...breaks].some((period) => !Number.isFinite(period.start) || !Number.isFinite(period.end) || period.start >= period.end)) throw new ServicesApiError("INVALID_INPUT", "Schedule contains an invalid period");
    if (periods.some((period, index) => index > 0 && period.start < periods[index - 1].end)) throw new ServicesApiError("INVALID_INPUT", "Working periods cannot overlap");
    if (breaks.some((period, index) => index > 0 && period.start < breaks[index - 1].end)) throw new ServicesApiError("INVALID_INPUT", "Breaks cannot overlap");
    if (breaks.some((item) => !periods.some((period) => item.start >= period.start && item.end <= period.end))) throw new ServicesApiError("INVALID_INPUT", "Breaks must be inside a working period");
  });
  if (blockedSlots.some((item) => !item.reason.trim() || Number.isNaN(Date.parse(item.startAt)) || Number.isNaN(Date.parse(item.endAt)) || new Date(item.startAt) >= new Date(item.endAt))) throw new ServicesApiError("INVALID_INPUT", "Blocked slots are invalid");
};

export const getServicesState = async () => clone(read());

export const saveService = async (input: T_SaveServiceDto) => {
  assertText(input.title, "Title"); assertText(input.slug, "Slug");
  if (input.price < 0 || input.durationMinutes <= 0 || input.bookingIntervalMinutes <= 0 || input.capacity <= 0) throw new ServicesApiError("INVALID_INPUT");
  if (input.variants.some((item) => !item.title.trim() || (item.price !== undefined && item.price < 0) || (item.durationMinutes !== undefined && item.durationMinutes <= 0))) throw new ServicesApiError("INVALID_INPUT", "Service variants are invalid");
  if (input.addOns.some((item) => !item.title.trim() || item.price < 0 || item.durationMinutes < 0)) throw new ServicesApiError("INVALID_INPUT", "Service add-ons are invalid");
  if (input.materials.some((item) => !item.itemId || !item.warehouseId || !item.locationId || !Number.isFinite(item.quantity) || item.quantity <= 0)) throw new ServicesApiError("INVALID_INPUT", "Service materials are invalid");
  const state = read();
  const duplicate = state.services.find((item) => item.slug.toLowerCase() === input.slug.trim().toLowerCase() && item.id !== input.id);
  if (duplicate) throw new ServicesApiError("CONFLICT", "Service slug already exists");
  const timestamp = now();
  const current = input.id ? state.services.find((item) => item.id === input.id) : undefined;
  const service: T_Service = { ...input, relatedProductIds: [...new Set(input.materials.filter((item) => item.itemType === "product").map((item) => item.itemId))], id: current?.id ?? id(), slug: input.slug.trim().toLowerCase(), createdAt: current?.createdAt ?? timestamp, updatedAt: timestamp };
  state.services = current ? state.services.map((item) => item.id === current.id ? service : item) : [service, ...state.services];
  persist(state); return clone(service);
};

const saveCollectionItem = <T extends { id: string }>(items: T[], item: T) => items.some((entry) => entry.id === item.id) ? items.map((entry) => entry.id === item.id ? item : entry) : [item, ...items];
export const saveServiceCategory = async (input: T_SaveServiceCategoryDto) => {
  assertText(input.name, "Name"); assertText(input.slug, "Slug"); const state = read();
  const item = { ...input, id: input.id ?? id(), slug: input.slug.trim().toLowerCase() };
  state.categories = saveCollectionItem(state.categories, item); persist(state); return clone(item);
};
export const saveServiceProvider = async (input: T_SaveServiceProviderDto) => {
  assertText(input.name, "Name"); validateSchedule(input.schedule, input.blockedSlots); const state = read(); const item = { ...input, id: input.id ?? id() };
  state.providers = saveCollectionItem(state.providers, item); persist(state); return clone(item);
};
export const saveServiceLocation = async (input: T_SaveServiceLocationDto) => {
  assertText(input.name, "Name"); assertText(input.timezone, "Timezone"); validateSchedule(input.schedule, input.blockedSlots); const state = read(); const item = { ...input, id: input.id ?? id() };
  state.locations = saveCollectionItem(state.locations, item); persist(state); return clone(item);
};

const appointmentDuration = (service: T_Service, input: T_CreateAppointmentDto) => {
  const variant = service.variants.find((item) => item.id === input.variantId);
  const addOns = service.addOns.filter((item) => input.addOnIds.includes(item.id));
  return (variant?.durationMinutes ?? service.durationMinutes) + service.preparationMinutes + service.cleanupMinutes + addOns.reduce((sum, item) => sum + item.durationMinutes, 0);
};
const appointmentPrice = (service: T_Service, input: T_CreateAppointmentDto) => {
  const variant = service.variants.find((item) => item.id === input.variantId);
  return (variant?.price ?? service.price) + service.addOns.filter((item) => input.addOnIds.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
};

export const createAppointment = async (input: T_CreateAppointmentDto) => {
  assertText(input.customerName, "Customer name"); assertText(input.customerEmail, "Customer email");
  const state = read(); const service = state.services.find((item) => item.id === input.serviceId && item.status === "active");
  const provider = state.providers.find((item) => item.id === input.providerId && item.status === "active");
  const location = state.locations.find((item) => item.id === input.locationId && item.status === "active");
  if (!service || !provider || !location) throw new ServicesApiError("NOT_FOUND");
  const start = new Date(input.startAt); if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) throw new ServicesApiError("INVALID_INPUT", "Appointment must be in the future");
  const availableSlots = await getAvailableServiceSlots(input.serviceId, input.providerId, input.locationId, input.startAt.slice(0, 10));
  if (!availableSlots.includes(start.toISOString())) throw new ServicesApiError("CONFLICT", "The selected time is outside availability");
  const end = new Date(start.getTime() + appointmentDuration(service, input) * 60_000);
  const conflict = state.appointments.some((item) => item.providerId === input.providerId && !["cancelled", "no_show"].includes(item.status) && new Date(item.startAt) < end && new Date(item.endAt) > start);
  if (conflict) throw new ServicesApiError("CONFLICT", "The selected time is no longer available");
  const timestamp = now();
  const appointment: T_Appointment = { ...input, id: id(), endAt: end.toISOString(), totalPrice: appointmentPrice(service, input), currency: service.currency, status: "pending", adminNote: "", statusHistory: [{ status: "pending", createdAt: timestamp, createdBy: input.customerName }], createdAt: timestamp, updatedAt: timestamp };
  state.appointments.unshift(appointment); persist(state); return clone(appointment);
};

export const updateAppointment = async (input: T_UpdateAppointmentDto) => {
  const state = read(); const current = state.appointments.find((item) => item.id === input.id);
  if (!current) throw new ServicesApiError("NOT_FOUND");
  const service = state.services.find((item) => item.id === current.serviceId);
  if (!service) throw new ServicesApiError("NOT_FOUND");
  const startAt = input.startAt ?? current.startAt;
  const providerId = input.providerId ?? current.providerId;
  const locationId = input.locationId ?? current.locationId;
  if (input.startAt || input.providerId || input.locationId) {
    const available = await getAvailableServiceSlots(current.serviceId, providerId, locationId, startAt.slice(0, 10), current.id);
    if (!available.includes(new Date(startAt).toISOString())) throw new ServicesApiError("CONFLICT", "The selected time is no longer available");
  }
  if (input.status === "cancelled" && !input.cancellationReason?.trim()) throw new ServicesApiError("INVALID_INPUT", "Cancellation reason is required");
  let materialsConsumedAt = current.materialsConsumedAt;
  if (input.status === "completed" && !materialsConsumedAt && service.materials.length) {
    await consumeServiceMaterials({ appointmentId: current.id, serviceTitle: service.title, createdBy: input.updatedBy, materials: service.materials.map((item) => ({ itemType: item.itemType, productId: item.itemId, variantId: item.variantId, warehouseId: item.warehouseId, locationId: item.locationId, quantity: item.quantity })) });
    materialsConsumedAt = now();
  }
  const endAt = input.startAt ? new Date(new Date(startAt).getTime() + appointmentDuration(service, current) * 60_000).toISOString() : current.endAt;
  const timestamp = now();
  const updated: T_Appointment = { ...current, ...input, providerId, locationId, startAt, endAt, materialsConsumedAt, updatedAt: timestamp, statusHistory: input.status && input.status !== current.status ? [{ status: input.status, createdAt: timestamp, createdBy: input.updatedBy, note: input.cancellationReason || input.adminNote }, ...current.statusHistory] : current.statusHistory };
  state.appointments = state.appointments.map((item) => item.id === current.id ? updated : item); persist(state); return clone(updated);
};

export const getAvailableServiceSlots = async (serviceId: string, providerId: string, locationId: string, date: string, excludedAppointmentId?: string) => {
  const state = read();
  const service = state.services.find((item) => item.id === serviceId);
  const provider = state.providers.find((item) => item.id === providerId && item.locationIds.includes(locationId));
  const location = state.locations.find((item) => item.id === locationId);
  if (!service || !provider || !location) return [];
  const selectedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(selectedDate.getTime())) return [];
  const day = selectedDate.getDay();
  const providerDay = provider.schedule.find((item) => item.dayOfWeek === day && item.enabled);
  const locationDay = location.schedule.find((item) => item.dayOfWeek === day && item.enabled);
  if (!providerDay || !locationDay) return [];
  const start = Math.max(Math.min(...providerDay.periods.map((item) => toMinutes(item.start))), Math.min(...locationDay.periods.map((item) => toMinutes(item.start))));
  const end = Math.min(Math.max(...providerDay.periods.map((item) => toMinutes(item.end))), Math.max(...locationDay.periods.map((item) => toMinutes(item.end))));
  const duration = service.durationMinutes + service.preparationMinutes + service.cleanupMinutes;
  const unavailable = [...providerDay.breaks, ...locationDay.breaks];
  const slots: string[] = [];
  for (let minute = start; minute + duration <= end; minute += service.bookingIntervalMinutes) {
    const hours = String(Math.floor(minute / 60)).padStart(2, "0"); const minutes = String(minute % 60).padStart(2, "0");
    const slotStart = new Date(`${date}T${hours}:${minutes}:00`); const slotEnd = new Date(slotStart.getTime() + duration * 60_000);
    const insideWorkingPeriod = providerDay.periods.some((period) => minute >= toMinutes(period.start) && minute + duration <= toMinutes(period.end)) && locationDay.periods.some((period) => minute >= toMinutes(period.start) && minute + duration <= toMinutes(period.end));
    const inBreak = unavailable.some((period) => minute < toMinutes(period.end) && minute + duration > toMinutes(period.start));
    const blocked = [...provider.blockedSlots, ...location.blockedSlots].some((item) => new Date(item.startAt) < slotEnd && new Date(item.endAt) > slotStart);
    const booked = state.appointments.some((item) => item.id !== excludedAppointmentId && item.providerId === providerId && !["cancelled", "no_show"].includes(item.status) && new Date(item.startAt) < slotEnd && new Date(item.endAt) > slotStart);
    if (insideWorkingPeriod && !inBreak && !blocked && !booked && slotStart.getTime() > Date.now()) slots.push(slotStart.toISOString());
  }
  return slots;
};

export const servicesApi = { getState: getServicesState, saveService, saveCategory: saveServiceCategory, saveProvider: saveServiceProvider, saveLocation: saveServiceLocation, createAppointment, updateAppointment } satisfies T_ServicesApiContract;
