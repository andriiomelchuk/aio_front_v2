export const adminModules = {
    dashboard: true,
    users: true,
    orders: true,
    products: true,
    categories: true,
    analytics: false,
    settings: true,
} as const;

export type T_AdminModule = keyof typeof adminModules;

export const isAdminModuleEnabled = (module: T_AdminModule) => {
    return adminModules[module];
}
