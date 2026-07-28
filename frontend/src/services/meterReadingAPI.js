import apiClient from "./apiClient";

const client = {
  get: (path, options) => apiClient.get(`/consumption${path}`, options),
  post: (path, payload, options) =>
    apiClient.post(`/consumption${path}`, payload, options),
};

function normalizeMeterReadings(records) {
  return Array.isArray(records)
    ? records.map((record) => ({
        id: record.id,
        consumerNo: String(record.consumer_id ?? ""),
        consumerName: record.consumer_name ?? "Unknown consumer",
        purok:
          record.purok_no != null
            ? `Purok ${record.purok_no}`
            : "Unassigned",
        previousReading: Number(record.previous_reading ?? 0),
        currentReading: Number(record.present_reading ?? 0),
        consumption: Number(record.consumption ?? 0),
        readingDate: record.reading_date,
        status: "Recorded",
      }))
    : [];
}

export async function fetchMeterReadings(options = {}) {
  const response = await client.get("/readings", options);
  return normalizeMeterReadings(response.data?.data ?? []);
}

export async function fetchAdminMeterReadings(options = {}) {
  const response = await client.get("/admin/readings", options);
  return normalizeMeterReadings(response.data?.data ?? []);
}

export async function createMeterReading(payload, options = {}) {
  const response = await client.post("/readings", {
    consumerId: Number(payload.consumerId),
    readingDate: payload.readingDate,
    previousReading: Number(payload.previousReading),
    presentReading: Number(payload.currentReading),
  }, options);
  return response.data?.data ?? response.data;
}

export default client;
