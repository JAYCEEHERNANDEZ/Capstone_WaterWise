import axios from "axios";
import { clearSession, getAccessToken } from "./authToken";

const configuredBaseUrl =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;

function resolveApiBaseUrl(value) {
  const baseUrl = (value || "/api").trim().replace(/\/+$/, "");

  // Accept either the Render service root or its complete /api URL.
  if (baseUrl === "/api" || /\/api$/i.test(baseUrl)) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
}

const API_BASE_URL = resolveApiBaseUrl(configuredBaseUrl);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
  // Authentication uses a Bearer token, so cross-origin cookies are unnecessary.
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status)) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export async function apiRequest(path, options = {}) {
  const response = await apiClient.request({
    url: path,
    method: options.method ?? "GET",
    data:
      typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body,
    headers: options.headers,
    signal: options.signal,
  });
  return response.data;
}

export function isCanceledRequest(error) {
  return (
    axios.isCancel(error) ||
    error?.code === "ERR_CANCELED" ||
    error?.name === "AbortError"
  );
}

export default apiClient;
