import type { T_SiteSettings } from "./types";

export const defaultSiteSettings: T_SiteSettings = {
  general: {
    siteName: "AIO Front",
    siteDescription: "A modular platform for commerce, movies, and developer tools.",
    logoUrl: "",
  },
  localization: {
    defaultLocale: "uk",
    currency: "USD",
    timezone: "Europe/Berlin",
  },
  contact: {
    email: "",
    phone: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
  },
  commerce: {
    lowStockThreshold: 5,
    showOutOfStockProducts: true,
    allowBackorders: false,
    orderPrefix: "AIO",
  },
  seo: {
    defaultTitle: "AIO",
    defaultDescription: "A modular web platform with commerce, movie discovery, and GitHub tools.",
    keywords: "",
    socialImageUrl: "",
  },
  operations: {
    maintenanceMode: false,
    emailNotifications: true,
  },
  updatedAt: "",
  updatedBy: "",
  changeLog: [],
};
