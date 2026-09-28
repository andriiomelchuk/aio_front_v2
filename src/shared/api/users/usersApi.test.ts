import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginStaff } from "@/shared/api/auth";
import { createUser, deleteUser, getUsers, updateUser } from "./usersApi";
import type { UsersApiError } from "./types";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

const userInput = {
  name: "Warehouse Manager",
  login: "warehouse.manager",
  email: "manager@example.com",
  password: "Manager123!",
  role: "manager" as const,
  roles: ["manager" as const],
  status: "active" as const,
};

beforeEach(() => {
  const storage = createStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => vi.unstubAllGlobals());

describe("users API", () => {
  it("creates a user and a matching staff login", async () => {
    const user = await createUser(userInput);

    expect(await getUsers()).toEqual([expect.objectContaining({ id: user.id, email: userInput.email })]);
    await expect(loginStaff({ email: userInput.email, password: userInput.password }))
      .resolves.toMatchObject({ role: "manager", displayName: userInput.name });
  });

  it("updates profile and login availability together", async () => {
    const user = await createUser(userInput);
    const updated = await updateUser({
      id: user.id,
      name: "Warehouse Viewer",
      email: "viewer@example.com",
      role: "viewer",
      roles: ["viewer"],
      status: "active",
    });

    expect(updated).toMatchObject({ name: "Warehouse Viewer", role: "viewer" });
    await expect(loginStaff({ email: "viewer@example.com", password: userInput.password }))
      .resolves.toMatchObject({ role: "viewer", displayName: "Warehouse Viewer" });
  });

  it("deletes both the user and their authentication account", async () => {
    const user = await createUser(userInput);
    await expect(deleteUser(user.id)).resolves.toBe(user.id);
    expect(await getUsers()).toEqual([]);
    await expect(loginStaff({ email: userInput.email, password: userInput.password })).rejects.toBeTruthy();
  });

  it("returns typed not-found errors for missing updates and deletes", async () => {
    await expect(updateUser({ id: 999, name: "Missing" }))
      .rejects.toMatchObject<Partial<UsersApiError>>({ code: "NOT_FOUND" });
    await expect(deleteUser(999))
      .rejects.toMatchObject<Partial<UsersApiError>>({ code: "NOT_FOUND" });
  });

  it("normalizes provider users once and then reads the cached collection", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: 7, name: "Remote User", username: "remote", email: "remote@example.com", phone: "123",
        address: { street: "Main", suite: "1", city: "Berlin", zipcode: "10115" },
        company: { name: "Remote GmbH" },
      }],
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getUsers()).toEqual([expect.objectContaining({ id: 7, role: "viewer", status: "invited" })]);
    expect(await getUsers()).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
