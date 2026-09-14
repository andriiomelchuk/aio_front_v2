import { createCustomer, deleteCustomer, getCustomerById } from "@/shared/api/customers";
import type {
  T_AuthRole,
  T_AuthSession,
  T_LoginCredentials,
  T_RegisterCredentials,
  T_StaffRole,
  T_StaffAccountInput,
  T_UpdateStaffAccountInput,
} from "./types";
import { AuthApiError } from "./types";

type T_StoredAccount = {
  id: string;
  customerId: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: T_AuthRole;
  createdAt: string;
};

const ACCOUNTS_STORAGE_KEY = "aio-auth-accounts";
const SESSION_STORAGE_KEY = "aio-auth-session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_HASH_ITERATIONS = 210_000;
const STAFF_ACCOUNTS_STORAGE_KEY = "aio-staff-accounts";

type T_StoredStaffAccount = Omit<T_StaffAccountInput, "password"> & {
  passwordHash: string;
  passwordSalt: string;
};

const DEVELOPMENT_STAFF_ACCOUNTS: Array<{
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: T_StaffRole;
}> = [
  { id: "staff-developer", email: "developer@aio.local", password: "Developer123!", displayName: "AIO Developer", role: "developer" },
  { id: "staff-owner", email: "owner@aio.local", password: "Owner123!", displayName: "AIO Owner", role: "owner" },
  { id: "staff-admin", email: "admin@aio.local", password: "Admin123!", displayName: "AIO Administrator", role: "admin" },
  { id: "staff-manager", email: "manager@aio.local", password: "Manager123!", displayName: "AIO Manager", role: "manager" },
  { id: "staff-viewer", email: "viewer@aio.local", password: "Viewer123!", displayName: "AIO Viewer", role: "viewer" },
];

const normalizeEmail = (email: string) => email.trim().toLocaleLowerCase();
const createId = () => crypto.randomUUID();
const bytesToBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes));

const createPasswordHash = async (password: string, salt: Uint8Array) => {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt.buffer as ArrayBuffer,
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    passwordKey,
    256,
  );

  return bytesToBase64(new Uint8Array(hash));
};

const loadAccounts = (): T_StoredAccount[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? (value as T_StoredAccount[]) : [];
  } catch {
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    return [];
  }
};

const saveAccounts = (accounts: T_StoredAccount[]) => {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

const loadStaffAccounts = (): T_StoredStaffAccount[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STAFF_ACCOUNTS_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? (value as T_StoredStaffAccount[]) : [];
  } catch {
    localStorage.removeItem(STAFF_ACCOUNTS_STORAGE_KEY);
    return [];
  }
};

const saveStaffAccounts = (accounts: T_StoredStaffAccount[]) => {
  localStorage.setItem(STAFF_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

export const createStaffAccount = async (input: T_StaffAccountInput) => {
  const accounts = loadStaffAccounts();
  const email = normalizeEmail(input.email);
  if (
    DEVELOPMENT_STAFF_ACCOUNTS.some((account) => account.email === email) ||
    accounts.some((account) => account.email === email)
  ) {
    throw new AuthApiError("EMAIL_EXISTS");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: T_StoredStaffAccount = {
    ...input,
    email,
    passwordHash: await createPasswordHash(input.password, salt),
    passwordSalt: bytesToBase64(salt),
  };
  saveStaffAccounts([...accounts, account]);
};

export const updateStaffAccount = (input: T_UpdateStaffAccountInput) => {
  const accounts = loadStaffAccounts();
  saveStaffAccounts(accounts.map((account) =>
    account.userId === input.userId
      ? { ...account, ...input, email: normalizeEmail(input.email) }
      : account,
  ));
};

export const deleteStaffAccount = (userId: number) => {
  saveStaffAccounts(loadStaffAccounts().filter((account) => account.userId !== userId));
};

const createSession = (account: T_StoredAccount, displayName: string) => ({
  id: createId(),
  customerId: account.customerId,
  email: account.email,
  displayName,
  role: account.role,
  expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
}) satisfies T_AuthSession;

export const registerCustomer = async (
  credentials: T_RegisterCredentials,
): Promise<T_AuthSession> => {
  const accounts = loadAccounts();
  const email = normalizeEmail(credentials.email);

  if (accounts.some((account) => account.email === email)) {
    throw new AuthApiError("EMAIL_EXISTS");
  }

  const accountId = createId();
  const customer = await createCustomer({
    userId: accountId,
    type: "individual",
    firstName: credentials.firstName.trim(),
    lastName: credentials.lastName.trim(),
    email,
    addresses: [],
    marketingConsent: credentials.marketingConsent,
  });

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const account: T_StoredAccount = {
      id: accountId,
      customerId: customer.id,
      email,
      passwordHash: await createPasswordHash(credentials.password, salt),
      passwordSalt: bytesToBase64(salt),
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
    return createSession(account, `${customer.firstName} ${customer.lastName}`.trim());
  } catch (error) {
    await deleteCustomer(customer.id);
    throw error;
  }
};

export const loginCustomer = async (
  credentials: T_LoginCredentials,
): Promise<T_AuthSession> => {
  const email = normalizeEmail(credentials.email);
  const account = loadAccounts().find((item) => item.email === email);

  if (!account) throw new AuthApiError("INVALID_CREDENTIALS");

  const salt = Uint8Array.from(atob(account.passwordSalt), (char) =>
    char.charCodeAt(0),
  );
  const passwordHash = await createPasswordHash(credentials.password, salt);

  if (passwordHash !== account.passwordHash) {
    throw new AuthApiError("INVALID_CREDENTIALS");
  }

  const customer = await getCustomerById(account.customerId);
  if (customer.status !== "active") {
    throw new AuthApiError("ACCOUNT_UNAVAILABLE");
  }

  return createSession(account, `${customer.firstName} ${customer.lastName}`.trim());
};

export const loginStaff = async (
  credentials: T_LoginCredentials,
): Promise<T_AuthSession> => {
  const email = normalizeEmail(credentials.email);
  const developmentAccount = DEVELOPMENT_STAFF_ACCOUNTS.find(
    (item) => item.email === email && item.password === credentials.password,
  );

  if (developmentAccount) {
    return {
      id: `${developmentAccount.id}-${createId()}`,
      customerId: "",
      email: developmentAccount.email,
      displayName: developmentAccount.displayName,
      role: developmentAccount.role,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  const account = loadStaffAccounts().find((item) => item.email === email);
  if (!account || account.status !== "active") {
    throw new AuthApiError("INVALID_CREDENTIALS");
  }

  const salt = Uint8Array.from(atob(account.passwordSalt), (char) => char.charCodeAt(0));
  const passwordHash = await createPasswordHash(credentials.password, salt);

  if (passwordHash !== account.passwordHash) throw new AuthApiError("INVALID_CREDENTIALS");

  return {
    id: `staff-${account.userId}-${createId()}`,
    customerId: "",
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };
};

export const loadAuthSession = (): T_AuthSession | null => {
  try {
    const value = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!value) return null;

    const session = JSON.parse(value) as T_AuthSession;
    if (!session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (session.role !== "customer") {
      const developmentAccount = DEVELOPMENT_STAFF_ACCOUNTS.find(
        (account) => account.email === session.email,
      );
      if (developmentAccount) {
        return { ...session, role: developmentAccount.role, displayName: developmentAccount.displayName };
      }

      const staffAccount = loadStaffAccounts().find(
        (account) => account.email === session.email,
      );
      if (!staffAccount || staffAccount.status !== "active") {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return { ...session, role: staffAccount.role, displayName: staffAccount.displayName };
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export const saveAuthSession = (session: T_AuthSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const updateAuthIdentity = async (
  session: T_AuthSession,
  identity: { email: string; displayName: string },
): Promise<T_AuthSession> => {
  const accounts = loadAccounts();
  const accountIndex = accounts.findIndex(
    ({ customerId }) => customerId === session.customerId,
  );
  const email = normalizeEmail(identity.email);

  if (accountIndex === -1) throw new AuthApiError("ACCOUNT_UNAVAILABLE");
  if (
    accounts.some(
      (account, index) => index !== accountIndex && account.email === email,
    )
  ) {
    throw new AuthApiError("EMAIL_EXISTS");
  }

  accounts[accountIndex] = { ...accounts[accountIndex], email };
  saveAccounts(accounts);

  const updatedSession: T_AuthSession = {
    ...session,
    email,
    displayName: identity.displayName.trim(),
  };
  saveAuthSession(updatedSession);
  return updatedSession;
};
