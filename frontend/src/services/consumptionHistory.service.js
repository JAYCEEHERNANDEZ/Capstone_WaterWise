import { apiRequest } from "./apiClient";
import { getStoredAccount } from "./authToken";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function toUsageRecord(record) {
  const consumption = Number(record.consumption);
  if (!record.reading_date || !Number.isFinite(consumption)) {
    throw new TypeError("The server returned an invalid consumption history record.");
  }
  const monthKey = String(record.reading_date).slice(0, 7);
  return {
    id: record.id,
    month: monthFormatter.format(new Date(`${monthKey}-01T00:00:00Z`)),
    year: monthKey.slice(0, 4),
    readingDate: record.reading_date,
    previousReading: Number(record.previous_reading),
    currentReading: Number(record.present_reading),
    volume: consumption,
  };
}

export async function fetchConsumptionHistory({ signal } = {}) {
  const user = getStoredAccount();
  if (!user || user.role !== "consumer") {
    throw new Error("An authenticated consumer account is required.");
  }
  const payload = await apiRequest(`/consumption/consumer/${user.id}`, { signal });
  const data = payload?.data;

  if (!Array.isArray(data)) {
    throw new TypeError("The server returned an invalid consumption history response.");
  }

  return data.map(toUsageRecord);
}
