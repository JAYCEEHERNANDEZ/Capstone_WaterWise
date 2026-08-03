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

function normalizeRecordingContext(record) {
  const receipt = record.current_month_receipt;
  const todayParts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Manila",
    year: "numeric",
  }).formatToParts(new Date());
  const todayValue = Object.fromEntries(todayParts.map((part) => [part.type, part.value]));
  const today = `${todayValue.year}-${todayValue.month}-${todayValue.day}`;
  const hasReadingInSelectedMonth = Boolean(record.has_reading_in_selected_month);
  const latestReadingDate = record.latest_reading_date ?? null;
  const fallbackBlockedByDate = Boolean(latestReadingDate && latestReadingDate >= today);
  const canRecord = record.can_record == null
    ? record.status !== "inactive" && record.purok_no != null && !hasReadingInSelectedMonth && !fallbackBlockedByDate
    : Boolean(record.can_record);
  return {
    id: record.consumer_id,
    consumerNo: String(record.consumer_id ?? ""),
    consumerName: record.consumer_name ?? "Unknown consumer",
    purok: record.purok_no != null ? `Purok ${record.purok_no}` : "Unassigned",
    status: record.status ?? "active",
    hasPreviousRecord: Boolean(record.has_previous_record),
    latestReadingId: record.latest_reading_id ?? null,
    latestReadingDate,
    latestCreatedAt: record.latest_created_at ?? null,
    latestPreviousReading: record.latest_previous_reading == null ? null : Number(record.latest_previous_reading),
    latestPresentReading: record.latest_present_reading == null ? null : Number(record.latest_present_reading),
    latestConsumption: record.latest_consumption == null ? null : Number(record.latest_consumption),
    averageRecentConsumption: record.average_recent_consumption == null ? null : Number(record.average_recent_consumption),
    hasReadingInSelectedMonth,
    canRecord,
    recordingBlockReason: record.recording_block_reason ?? (
      fallbackBlockedByDate
        ? `Latest reading is dated ${latestReadingDate}; recording is unavailable today.`
        : null
    ),
    currentMonthReceipt: receipt ? {
      readingId: receipt.reading_id,
      readingDate: receipt.reading_date,
      createdAt: receipt.created_at,
      previousReading: Number(receipt.previous_reading),
      currentReading: Number(receipt.present_reading),
      consumption: Number(receipt.consumption),
      baselineBill: Number(receipt.baseline_bill),
      billingId: receipt.billing_id,
      dueDate: receipt.due_date,
      arrears30Days: Number(receipt.over_30_days ?? 0),
      arrears60Days: Number(receipt.over_60_days ?? 0),
      arrears90Days: Number(receipt.over_90_days ?? 0),
    } : null,
  };
}

function normalizeCreatedReading(record) {
  return {
    id: record.id,
    consumerId: record.consumer_id,
    createdAt: record.created_at,
    readingDate: record.reading_date,
    previousReading: Number(record.previous_reading),
    currentReading: Number(record.present_reading),
    consumption: Number(record.consumption),
    billing: record.billing ? {
      ...record.billing,
      totalBill: Number(record.billing.total_bill),
      dueDate: record.billing.due_date,
    } : null,
  };
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
    idempotencyKey: payload.idempotencyKey,
    presentReading: Number(payload.currentReading),
    ...(payload.initialPreviousReading != null ? { initialPreviousReading: Number(payload.initialPreviousReading) } : {}),
  }, options);
  return normalizeCreatedReading(response.data?.data ?? response.data);
}

export async function fetchRecordingContexts(options = {}) {
  const response = await client.get("/readings/contexts", options);
  return Array.isArray(response.data?.data) ? response.data.data.map(normalizeRecordingContext) : [];
}

export async function fetchRecordingContext(consumerId, options = {}) {
  const response = await client.get(`/readings/context/${consumerId}`, options);
  return normalizeRecordingContext(response.data?.data ?? {});
}

export default client;
