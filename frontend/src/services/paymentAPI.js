import apiClient from "./apiClient";

export function normalizePaymentRecord(record) {
  const remainingBalance = Number(record.remaining_balance ?? 0);
  return {
    id: record.id,
    billingId: record.billing_id,
    consumerName: record.consumerName ?? `Billing #${record.billing_id}`,
    paymentDate: record.payment_date ?? record.created_at,
    paymentMethod: record.payment_method ?? "Cash",
    referenceNumber: record.reference_number ?? "",
    amountPaid: Number(record.total_paid ?? 0),
    remainingBalance,
    paymentStatus: remainingBalance === 0 ? "Paid" : "Partially Paid",
    raw: record,
  };
}

export async function fetchPaymentHistory(options = {}) {
  const response = await apiClient.get("/payments", options);
  const records = response.data?.data ?? [];
  return Array.isArray(records) ? records.map(normalizePaymentRecord) : [];
}

export async function fetchPaymentByBillingId(billingId, options = {}) {
  const response = await apiClient.get(`/payments/billing/${billingId}`, options);
  const records = response.data?.data ?? [];
  return Array.isArray(records) ? records.map(normalizePaymentRecord) : [];
}

export async function fetchConsumerPayments(consumerId, options = {}) {
  const response = await apiClient.get(`/payments/consumer/${consumerId}`, options);
  const records = response.data?.data ?? [];
  return Array.isArray(records) ? records.map(normalizePaymentRecord) : [];
}

export async function recordPayment(payload, options = {}) {
  const response = await apiClient.post("/payments", {
    billingId: payload.billingId,
    idempotencyKey: payload.idempotencyKey,
    paymentDate: payload.paymentDate,
    paymentMethod: payload.paymentMethod,
    referenceNumber: payload.referenceNumber || null,
    totalPaid: Number(payload.amountPaid ?? payload.amount),
  }, options);
  const result = response.data?.data;
  return {
    billing: result.billing,
    payment: normalizePaymentRecord(result),
  };
}
