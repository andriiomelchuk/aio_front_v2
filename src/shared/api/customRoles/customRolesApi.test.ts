import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyCustomRole } from "@/entities/customRole";
import { hasAdminPermission } from "@/shared/config/adminPermissions";
import { getCustomRoleAuditSync, getCustomRoles, saveCustomRole, setCustomRoleStatus } from "./customRolesApi";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null, removeItem: (key) => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); } };
};

beforeEach(() => {
  const localStorage = createStorage();
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
  vi.stubGlobal("crypto", { randomUUID: () => "test-id" });
});
afterEach(() => vi.unstubAllGlobals());

const roleInput = () => {
  const input = createEmptyCustomRole();
  input.key = "warehouse-worker";
  input.translations.uk.name = "Warehouse worker";
  input.permissions = { warehouse: ["view", "create", "manage"], developerSettings: ["view", "manage"] };
  return input;
};

describe("custom roles API", () => {
  it("creates a role, limits grants to the actor and writes audit", async () => {
    const role = await saveCustomRole(roleInput(), "owner");

    expect(role.id).toBe("custom:test-id");
    expect(role.permissions.warehouse).toEqual(["view", "create", "manage"]);
    expect(role.permissions.developerSettings).toEqual([]);
    expect(getCustomRoleAuditSync()[0]).toMatchObject({ roleId: role.id, action: "create", actorRole: "owner" });
  });

  it("uses deny-by-default and removes access from an archived role", async () => {
    const role = await saveCustomRole(roleInput(), "developer");
    expect(hasAdminPermission(role.id, "warehouse", "view")).toBe(true);
    expect(hasAdminPermission(role.id, "orders", "view")).toBe(false);

    await setCustomRoleStatus(role.id, "archived", "developer");
    expect(hasAdminPermission(role.id, "warehouse", "view")).toBe(false);
  });

  it("rejects unsafe actors and malformed stored roles", async () => {
    await expect(saveCustomRole(roleInput(), "manager")).rejects.toThrow("Only an owner or developer");
    localStorage.setItem("aio-custom-roles-v1", JSON.stringify([{ id: "custom:broken" }]));
    await expect(getCustomRoles()).resolves.toEqual([]);
  });
});
