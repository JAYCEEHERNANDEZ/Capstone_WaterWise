import { supabase } from "../config/supabase.js";

const PAYMENT_FIELDS =
  "id, billing_id, total_paid, remaining_balance, created_at, updated_at";

const createError = (message, statusCode = 400) => {
  const error = new TypeError(message);
  error.statusCode = statusCode;
  return error;
};

const parsePositiveId = (value, fieldName) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw createError(`A valid ${fieldName} is required.`);
  }
  return id;
};

const parsePaymentAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError("Payment amount must be greater than zero.");
  }
  return Number(amount.toFixed(2));
};

export async function createPayment({ billingId, totalPaid, amount }) {
  const normalizedBillingId = parsePositiveId(billingId, "billing ID");
  const paymentAmount = parsePaymentAmount(totalPaid ?? amount);

  const { data: billing, error: billingError } = await supabase
    .from("billing")
    .select("id, user_id, total_bill, remaining_balance, status")
    .eq("id", normalizedBillingId)
    .maybeSingle();

  if (billingError) {
    throw createError(`Failed to retrieve billing: ${billingError.message}`, 500);
  }
  if (!billing) {
    throw createError("Billing record not found.", 404);
  }

  const currentBalance = Number(billing.remaining_balance ?? 0);
  if (currentBalance <= 0 || billing.status === "Paid") {
    throw createError("This billing record is already fully paid.", 409);
  }
  if (paymentAmount > currentBalance) {
    throw createError("Payment amount cannot exceed the remaining balance.");
  }

  const remainingBalance = Number((currentBalance - paymentAmount).toFixed(2));
  const nextStatus = remainingBalance === 0 ? "Paid" : "Partially Paid";

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      billing_id: normalizedBillingId,
      total_paid: paymentAmount,
      remaining_balance: remainingBalance,
    })
    .select(PAYMENT_FIELDS)
    .single();

  if (paymentError) {
    if (paymentError.code === "23503") {
      throw createError("Billing record not found.", 404);
    }
    throw createError(`Failed to create payment: ${paymentError.message}`, 500);
  }

  const { data: updatedBilling, error: updateError } = await supabase
    .from("billing")
    .update({
      remaining_balance: remainingBalance,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedBillingId)
    .eq("remaining_balance", currentBalance)
    .select(
      "id, consumption_id, user_id, billing_date, due_date, total_bill, remaining_balance, status, created_at, updated_at"
    )
    .single();

  if (updateError) {
    await supabase.from("payments").delete().eq("id", payment.id);
    if (updateError.code === "PGRST116") {
      throw createError(
        "The billing balance changed while this payment was being processed. Please try again.",
        409
      );
    }
    throw createError(
      `Failed to update billing after payment: ${updateError.message}`,
      500
    );
  }

  return { ...payment, billing: updatedBilling };
}

export async function getPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_FIELDS)
    .order("created_at", { ascending: false });

  if (error) {
    throw createError(`Failed to retrieve payments: ${error.message}`, 500);
  }
  return data ?? [];
}

export async function getPaymentById(id) {
  const paymentId = parsePositiveId(id, "payment ID");
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_FIELDS)
    .eq("id", paymentId)
    .maybeSingle();

  if (error) {
    throw createError(`Failed to retrieve payment: ${error.message}`, 500);
  }
  if (!data) {
    throw createError("Payment record not found.", 404);
  }
  return data;
}

export async function getPaymentsByBilling(billingId) {
  const normalizedBillingId = parsePositiveId(billingId, "billing ID");
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_FIELDS)
    .eq("billing_id", normalizedBillingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw createError(`Failed to retrieve billing payments: ${error.message}`, 500);
  }
  return data ?? [];
}

export async function getPaymentsByConsumer(consumerId) {
  const userId = parsePositiveId(consumerId, "consumer ID");
  const { data: billings, error: billingError } = await supabase
    .from("billing")
    .select("id")
    .eq("user_id", userId);

  if (billingError) {
    throw createError(
      `Failed to retrieve consumer billings: ${billingError.message}`,
      500
    );
  }

  const billingIds = (billings ?? []).map((billing) => billing.id);
  if (billingIds.length === 0) return [];

  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_FIELDS)
    .in("billing_id", billingIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw createError(`Failed to retrieve consumer payments: ${error.message}`, 500);
  }
  return data ?? [];
}
