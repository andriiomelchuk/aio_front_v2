export const adminModules = {
    dashboard: true,
    users: true,
    customers: true,
    orders: true,
    products: true,
    categories: true,
    pages: true,
    menus: true,
    translations: true,
    analytics: true,
    settings: true,
} as const;

export type T_AdminModule = keyof typeof adminModules;

export const isAdminModuleEnabled = (module: T_AdminModule) => {
    return adminModules[module];
}
