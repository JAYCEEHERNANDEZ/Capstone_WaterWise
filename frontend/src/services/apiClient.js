import axios from "axios";
import { clearSession, getAccessToken } from "./authToken";

const configuredBaseUrl =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (configuredBaseUrl || "/api").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
  withCredentials: true,
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
