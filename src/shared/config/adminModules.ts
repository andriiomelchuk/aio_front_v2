export const adminModules = {
    dashboard: true,
    users: true,
    customers: true,
    orders: true,
    products: true,
    warehouse: true,
    imports: true,
    services: true,
    categories: true,
    pages: true,
    menus: true,
    translations: true,
    analytics: true,
    settings: true,
    developerSettings: true,
} as const;

export type T_AdminModule = keyof typeof adminModules;
