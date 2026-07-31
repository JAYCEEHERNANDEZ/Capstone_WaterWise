import apiClient from "./apiClient";

const client = {
  get: (path, options) => apiClient.get(`/consumers${path}`, options),
  post: (path, payload, options) =>
    apiClient.post(`/consumers${path}`, payload, options),
  patch: (path, payload, options) =>
    apiClient.patch(`/consumers${path}`, payload, options),
};

function normalizeConsumer(consumer) {
  return {
    ...consumer,
    accountName: consumer.username ?? "",
    consumerName: consumer.full_name ?? "",
    consumerNo: String(consumer.id ?? ""),
    fullName: consumer.full_name ?? "",
    purok: consumer.purok_no != null ? `Purok ${consumer.purok_no}` : "Unassigned",
    status: consumer.status ?? "active",
  };
}

function toConsumerPayload(consumer, includePassword = false) {
  const purokNo = Number(String(consumer.purok ?? "").replace(/\D/g, ""));
  return {
    username: consumer.accountName,
    fullName: consumer.fullName,
    email: consumer.email,
    purokNo: Number.isInteger(purokNo) && purokNo > 0 ? purokNo : null,
    ...(includePassword && consumer.password ? { password: consumer.password } : {}),
  };
}

export async function fetchConsumerDirectory(options = {}) {
  const response = await client.get("/", options);
  return Array.isArray(response.data?.data)
    ? response.data.data.map(normalizeConsumer)
    : [];
}

export async function createConsumer(consumer, options = {}) {
  const response = await client.post("/", toConsumerPayload(consumer, true), options);

  return response.data?.data ? normalizeConsumer(response.data.data) : null;
}

export async function updateConsumer(id, consumer, options = {}) {
  const response = await client.patch(`/${id}`, toConsumerPayload(consumer), options);
  return response.data?.data ? normalizeConsumer(response.data.data) : null;
}
