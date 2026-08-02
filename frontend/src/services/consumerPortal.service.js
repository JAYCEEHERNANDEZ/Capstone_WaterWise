import { apiRequest } from "./apiClient";
import { getStoredAccount } from "./authToken";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatDate(value) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00Z`)) : "";
}

function formatMonth(value) {
  return value
    ? monthFormatter.format(new Date(`${String(value).slice(0, 7)}-01T00:00:00Z`))
    : "No readings";
}

function isCurrentMonth(value) {
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return String(value ?? "").slice(0, 7) === currentMonth;
}

async function requireConsumerAccount() {
  const user = getStoredAccount();
  if (!user || user.role !== "consumer") {
    throw new Error("An authenticated consumer account is required.");
  }
  return user;
}

function normalizeBilling(record, profile, reading) {
  return {
    id: record.id,
    invoiceNumber: `INV-${record.id}`,
    name: profile.full_name,
    consumerName: profile.full_name,
    billingPeriod: formatMonth(record.billing_date),
    readingDate: reading?.reading_date ?? record.billing_date,
    cubicMetersConsumed: Number(reading?.consumption ?? 0),
    amountDue: Number(record.total_bill ?? 0),
    remainingBalance: Number(record.remaining_balance ?? 0),
    outstandingBalance: Number(record.remaining_balance ?? 0),
    status: record.status ?? "Unpaid",
    address: profile.purok_no != null ? `Purok ${profile.purok_no}` : "",
    previousReading: Number(reading?.previous_reading ?? 0),
    currentReading: Number(reading?.present_reading ?? 0),
    dueDate: record.due_date,
  };
}

export async function fetchConsumerProfile(options) {
  const account = await requireConsumerAccount();
  const [profilePayload, billingPayload, consumptionPayload] = await Promise.all([
    apiRequest(`/consumers/${account.id}`, options),
    apiRequest(`/billing/consumer/${account.id}`, options),
    apiRequest(`/consumption/consumer/${account.id}`, options),
  ]);
  const consumer = profilePayload.data;
  const billings = billingPayload.data ?? [];
  const readings = consumptionPayload.data ?? [];
  const latestReading = readings.at(-1);
  const currentBillings = billings.filter((record) =>
    isCurrentMonth(record.billing_date)
  );

  return {
    accountId: `ACC-${consumer.id}`,
    name: consumer.full_name ?? consumer.username,
    purok: consumer.purok_no != null ? `Purok ${consumer.purok_no}` : "Not provided",
    houseNumber: "Not provided",
    email: consumer.email,
    contactNumber: consumer.contact_number || "Not provided",
    meterNumber: "Not provided",
    status: consumer.status,
    activeAmountDue: currentBillings.reduce(
      (total, record) => total + Number(record.remaining_balance ?? 0),
      0,
    ),
    dueDate: formatDate(currentBillings[0]?.due_date),
    latestMonth: formatMonth(latestReading?.reading_date),
    volumetricUsage: Number(latestReading?.consumption ?? 0),
    previousReading: Number(latestReading?.previous_reading ?? 0),
    currentReading: Number(latestReading?.present_reading ?? 0),
    lastReadingDate: formatDate(latestReading?.reading_date) || "No reading recorded",
  };
}

export async function fetchBillingLedger(options) {
  const account = await requireConsumerAccount();
  const [profilePayload, billingPayload, consumptionPayload] = await Promise.all([
    apiRequest(`/consumers/${account.id}`, options),
    apiRequest(`/billing/consumer/${account.id}`, options),
    apiRequest(`/consumption/consumer/${account.id}`, options),
  ]);
  const profile = profilePayload.data;
  const readingsById = new Map(
    (consumptionPayload.data ?? []).map((reading) => [reading.id, reading])
  );
  const historyData = (billingPayload.data ?? []).map((record) =>
    normalizeBilling(record, profile, readingsById.get(record.consumption_id))
  );
  const outstandingBalance = historyData.reduce(
    (total, record) => total + record.remainingBalance,
    0,
  );

  return {
    historyData,
    ledgerAccount: {
      accountId: `ACC-${profile.id}`,
      name: profile.full_name,
      outstandingBalance,
      dueDate: formatDate(
        historyData.find((record) => record.remainingBalance > 0)?.dueDate
      ),
    },
    officialReceipt: null,
  };
}

export async function fetchCurrentBalance(options) {
  const account = await requireConsumerAccount();
  const payload = await apiRequest(`/billing/consumer/${account.id}`, options);
  return (payload.data ?? [])
    .filter((record) => isCurrentMonth(record.billing_date))
    .reduce(
    (total, record) => total + Number(record.remaining_balance ?? 0),
    0,
  );
}

export async function fetchNotifications(options) {
  const account = await requireConsumerAccount();
  const payload = await apiRequest(
    `/notifications?consumerId=${encodeURIComponent(account.id)}`,
    options,
  );

  return (payload.data ?? []).map((notification) => {
    const isBillingAlert =
      String(notification.announcement_type).toLowerCase() === "billing alert";

    return {
      id: notification.id,
      category: isBillingAlert ? "bill" : "announcement",
      title: notification.title,
      message: notification.message,
      date: notification.announcement_date,
      isRead: Boolean(notification.is_read),
      actionPath: isBillingAlert
        ? "/consumer/billing-ledger?receipt=official"
        : undefined,
    };
  });
}

export async function markNotificationRead(notificationId, options) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    ...options,
    method: "PUT",
  });
}

export async function deleteNotification() {}
