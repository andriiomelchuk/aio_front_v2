import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateCustomer } from "@/shared/api/customers";
import {
  clearAuthSession,
  createStaffAccount,
  deleteStaffAccount,
  loadAuthSession,
  loginCustomer,
  loginStaff,
  registerCustomer,
  saveAuthSession,
  updateAuthIdentity,
  updateStaffAccount,
} from "./authApi";
import type { AuthApiError } from "./types";

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

beforeEach(() => {
  const storage = createStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => vi.unstubAllGlobals());

describe("customer authentication", () => {
  it("registers a normalized account and authenticates it again", async () => {
    const registered = await registerCustomer({
      firstName: " Jane ",
      lastName: " Doe ",
      email: " JANE@Example.com ",
      password: "StrongPassword123!",
      marketingConsent: true,
    });

    const loggedIn = await loginCustomer({
      email: "jane@example.com",
      password: "StrongPassword123!",
    });

    expect(registered).toMatchObject({ email: "jane@example.com", displayName: "Jane Doe", role: "customer" });
    expect(loggedIn.customerId).toBe(registered.customerId);
    expect(JSON.parse(localStorage.getItem("aio-auth-accounts") ?? "[]")[0]).not.toHaveProperty("password");
  });

  it("rejects duplicate email and invalid credentials with stable error codes", async () => {
    const credentials = {
      firstName: "Jane", lastName: "Doe", email: "jane@example.com",
      password: "StrongPassword123!", marketingConsent: false,
    };
    await registerCustomer(credentials);

    await expect(registerCustomer({ ...credentials, email: "JANE@example.com" }))
      .rejects.toMatchObject<Partial<AuthApiError>>({ code: "EMAIL_EXISTS" });
    await expect(loginCustomer({ email: credentials.email, password: "WrongPassword!" }))
      .rejects.toMatchObject<Partial<AuthApiError>>({ code: "INVALID_CREDENTIALS" });
  });

  it("blocks login for an unavailable customer", async () => {
    const session = await registerCustomer({
      firstName: "Jane", lastName: "Doe", email: "jane@example.com",
      password: "StrongPassword123!", marketingConsent: false,
    });
    await updateCustomer({ id: session.customerId, status: "blocked" });

    await expect(loginCustomer({ email: session.email, password: "StrongPassword123!" }))
      .rejects.toMatchObject<Partial<AuthApiError>>({ code: "ACCOUNT_UNAVAILABLE" });
  });

  it("persists, updates and expires a session safely", async () => {
    const session = await registerCustomer({
      firstName: "Jane", lastName: "Doe", email: "jane@example.com",
      password: "StrongPassword123!", marketingConsent: false,
    });
    saveAuthSession(session);
    expect(loadAuthSession()?.customerId).toBe(session.customerId);

    const updated = await updateAuthIdentity(session, { email: "new@example.com", displayName: "Jane New" });
    expect(loadAuthSession()).toMatchObject({ email: "new@example.com", displayName: "Jane New" });
    await expect(loginCustomer({ email: "new@example.com", password: "StrongPassword123!" })).resolves.toBeTruthy();

    localStorage.setItem("aio-auth-session", JSON.stringify({ ...updated, expiresAt: "2000-01-01T00:00:00.000Z" }));
    expect(loadAuthSession()).toBeNull();
    clearAuthSession();
    expect(localStorage.getItem("aio-auth-session")).toBeNull();
  });
});

describe("staff authentication", () => {
  it("keeps built-in developer access available", async () => {
    await expect(loginStaff({ email: "DEVELOPER@aio.local", password: "Developer123!" }))
      .resolves.toMatchObject({ role: "developer", displayName: "AIO Developer" });
  });

  it("creates, updates, blocks and deletes a custom staff account", async () => {
    await createStaffAccount({
      userId: 42, email: "manager@example.com", password: "Manager123!",
      displayName: "First Manager", role: "manager", roles: ["manager"], status: "active",
    });
    await expect(loginStaff({ email: "manager@example.com", password: "Manager123!" }))
      .resolves.toMatchObject({ displayName: "First Manager", role: "manager" });

    updateStaffAccount({
      userId: 42, email: "manager@example.com", displayName: "Blocked Manager",
      role: "manager", roles: ["manager"], status: "blocked",
    });
    await expect(loginStaff({ email: "manager@example.com", password: "Manager123!" }))
      .rejects.toMatchObject<Partial<AuthApiError>>({ code: "INVALID_CREDENTIALS" });

    deleteStaffAccount(42);
    expect(JSON.parse(localStorage.getItem("aio-staff-accounts") ?? "[]")).toEqual([]);
  });
});
