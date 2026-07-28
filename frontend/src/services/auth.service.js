import { apiRequest } from "./apiClient";
import {
  ACCOUNT_STORAGE_KEY,
  clearSession,
  getStoredAccount,
  storeSession,
} from "./authToken";

export { ACCOUNT_STORAGE_KEY };

export async function login(credentials) {
  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    storeSession(result);
    return result;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ??
        error.message ??
        "Unable to sign in.",
      { cause: error },
    );
  }
}

export async function getCurrentAccount(options) {
  const result = await apiRequest("/auth/me", options);
  const storedAccount = getStoredAccount();
  const user = { ...storedAccount, ...result.user };
  window.sessionStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(user));
  return { user };
}

export function logout() {
  clearSession();
  return Promise.resolve();
}
