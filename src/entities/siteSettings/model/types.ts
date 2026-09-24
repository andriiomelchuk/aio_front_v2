export type T_SiteLocale = "uk" | "en" | "de" | "ru";
export type T_SiteCurrency = "UAH" | "USD" | "EUR" | "GBP";

export type T_SiteSettingsAuditEntry = {
  id: string;
  action: "update" | "import" | "reset";
  createdAt: string;
  updatedBy: string;
};

export type T_SiteSettings = {
  general: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
  };
  localization: {
    defaultLocale: T_SiteLocale;
    enabledLocales: T_SiteLocale[];
    currency: T_SiteCurrency;
    timezone: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
  };
  commerce: {
    lowStockThreshold: number;
    showOutOfStockProducts: boolean;
    allowBackorders: boolean;
    orderPrefix: string;
  };
  business: {
    mode: "commerce" | "services" | "both";
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
    socialImageUrl: string;
  };
  operations: {
    maintenanceMode: boolean;
    emailNotifications: boolean;
  };
  updatedAt: string;
  updatedBy: string;
  changeLog: T_SiteSettingsAuditEntry[];
};

export type T_UpdateSiteSettingsDto = Omit<
  T_SiteSettings,
  "updatedAt" | "updatedBy" | "changeLog"
>;
