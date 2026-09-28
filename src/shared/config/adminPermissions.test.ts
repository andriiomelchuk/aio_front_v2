import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminModuleFromPath, hasAdminPermission } from "./adminPermissions";

afterEach(() => vi.unstubAllGlobals());

describe("admin permissions", () => {
  it("keeps developer-only settings inaccessible to every other system role", () => {
    expect(hasAdminPermission("developer", "developerSettings", "manage")).toBe(true);
    expect(hasAdminPermission("owner", "developerSettings", "view")).toBe(false);
    expect(hasAdminPermission("admin", "developerSettings", "view")).toBe(false);
  });

  it("allows viewers to inspect operations without changing them", () => {
    expect(hasAdminPermission("viewer", "orders", "view")).toBe(true);
    expect(hasAdminPermission("viewer", "orders", "manage")).toBe(false);
    expect(hasAdminPermission("viewer", "warehouse", "edit")).toBe(false);
  });

  it("lets managers prepare payroll but not approve it", () => {
    expect(hasAdminPermission("manager", "payroll", "view")).toBe(true);
    expect(hasAdminPermission("manager", "payroll", "edit")).toBe(true);
    expect(hasAdminPermission("manager", "payroll", "approve")).toBe(false);
  });

  it("uses deny-by-default for malformed or archived custom roles", () => {
    const storage = {
      getItem: () => JSON.stringify([{ id: "custom:barber", status: "archived", permissions: { services: ["view", "manage"] } }]),
    };
    vi.stubGlobal("window", { localStorage: storage });
    vi.stubGlobal("localStorage", storage);

    expect(hasAdminPermission("custom:barber", "services", "view")).toBe(false);
    expect(hasAdminPermission("custom:missing", "services", "view")).toBe(false);
  });

  it("maps nested admin routes to their owning module", () => {
    expect(getAdminModuleFromPath("/admin/orders/AIO-000001")).toBe("orders");
    expect(getAdminModuleFromPath("/admin/developer-settings")).toBe("developerSettings");
    expect(getAdminModuleFromPath("/admin/unknown")).toBe("dashboard");
  });
});
