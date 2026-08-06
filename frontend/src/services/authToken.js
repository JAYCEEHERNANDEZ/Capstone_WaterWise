export const ACCOUNT_STORAGE_KEY = "user";
export const TOKEN_STORAGE_KEY = "accessToken";

export function getAccessToken() {
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getAccessTokenExpiresAt(token = getAccessToken()) {
  try {
    if (!token) return null;
    const encodedPayload = token.split(".")[1];
    const normalizedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(window.atob(paddedPayload));
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
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
  const token = getAccessToken();
  const expiresAt = getAccessTokenExpiresAt(token);
  if (!token || !expiresAt || expiresAt <= Date.now()) {
    clearSession();
    return false;
  }
  return Boolean(getStoredAccount());
}
