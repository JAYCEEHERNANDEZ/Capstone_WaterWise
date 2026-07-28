export const ACCOUNT_STORAGE_KEY = "user";
export const TOKEN_STORAGE_KEY = "accessToken";

export function getAccessToken() {
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeSession({ token, user }) {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.sessionStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(ACCOUNT_STORAGE_KEY);
}

export function getStoredAccount() {
  try {
    return JSON.parse(window.sessionStorage.getItem(ACCOUNT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function hasAuthenticatedSession() {
  return Boolean(getAccessToken() && getStoredAccount());
}
