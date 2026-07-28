import { useState } from "react";

function PaymentForm({ onSubmit = () => {}, initialData = null, billingRecords = [], lockBillingDetails = false, showPaymentMethod = true }) {
  const initialState = {
    consumerName: "",
    currentBalance: "",
    amountPaid: "",
    paymentDate: "",
    paymentMethod: "",
  };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        billingId: initialData.billingId,
        consumerName: initialData.consumerName || "",
        currentBalance: String(initialData.currentBalance || ""),
        amountPaid: String(initialData.amountPaid || ""),
        paymentDate: initialData.paymentDate || new Date().toISOString().split("T")[0],
        paymentMethod: initialData.paymentMethod || "Cash",
      };
    }
    return initialState;
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const balance = Number(form.currentBalance) || 0;
  const paid = Number(form.amountPaid) || 0;
  const selectedBilling = billingRecords.find((record) => record.id === form.billingId);
  const isPayment2 = (selectedBilling?.raw?.payments?.length ?? 0) > 0 || selectedBilling?.status === "Partially Paid";
  const remainingBalance = Math.max(balance - paid, 0);
  const paymentStatus = paid <= 0
    ? "Unpaid"
    : paid >= balance
      ? "Paid"
      : "Partially Paid";

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "consumerName") {
      const billing = billingRecords.find(
        (record) => record.consumerName.toLowerCase() === value.trim().toLowerCase(),
      );
      setForm((previous) => ({
        ...previous,
        consumerName: value,
        billingId: billing?.id,
        currentBalance: billing ? String(billing.outstandingBalance) : previous.currentBalance,
      }));
      setErrors((previous) => ({ ...previous, consumerName: "", currentBalance: "" }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.consumerName.trim()) {
      newErrors.consumerName = "Consumer Name is required.";
    }

    if (!form.currentBalance) {
      newErrors.currentBalance = "Current Balance is required.";
    }

    if (!form.amountPaid) {
      newErrors.amountPaid = "Amount Paid is required.";
    } else if (Number(form.amountPaid) <= 0) {
      newErrors.amountPaid = "Amount Paid must be greater than zero.";
    } else if (Number(form.amountPaid) > Number(form.currentBalance)) {
      newErrors.amountPaid = "Amount Paid cannot exceed balance.";
    } else if (isPayment2 && Math.round(Number(form.amountPaid) * 100) !== Math.round(Number(form.currentBalance) * 100)) {
      newErrors.amountPaid = "Payment 2 must be equal to the remaining balance.";
    }

    if (!form.paymentDate) {
      newErrors.paymentDate = "Payment Date is required.";
    }

    if (!form.paymentMethod.trim()) {
      newErrors.paymentMethod = "Payment Method is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const saved = await onSubmit({
        ...form,
        currentBalance: Number(form.currentBalance),
        amountPaid: Number(form.amountPaid),
        remainingBalance,
        paymentStatus,
        billingId: form.billingId,
      });

      if (saved !== false) {
        setForm(initialState);
        setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="payment-form-section"
      className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold">Payment Form</h2>

      <p className="text-sm text-slate-500">The first entry is saved as Payment 1; the next entry for the same bill is saved as Payment 2.</p>

      <div>
        <label htmlFor="consumerName">Consumer Name</label>
        <input
          id="consumerName"
          name="consumerName"
          type="text"
          placeholder="Consumer Name"
          value={form.consumerName}
          onChange={handleChange}
          readOnly={lockBillingDetails}
          list="billable-consumers"
          className={`w-full border rounded p-2 ${lockBillingDetails ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""}`}
        />
        <datalist id="billable-consumers">
          {billingRecords.filter((record) => record.outstandingBalance > 0).map((record) => (
            <option key={record.id} value={record.consumerName}>{`Balance: ₱${record.outstandingBalance}`}</option>
          ))}
        </datalist>
        {errors.consumerName && (
          <p role="alert" className="text-red-500">{errors.consumerName}</p>
        )}
      </div>

      <div>
        <label htmlFor="currentBalance">Current Balance</label>
        <input
          id="currentBalance"
          name="currentBalance"
          type="number"
          placeholder="Current Balance"
          value={form.currentBalance}
          onChange={handleChange}
          readOnly={lockBillingDetails || Boolean(form.billingId)}
          className={`w-full border rounded p-2 ${lockBillingDetails || form.billingId ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""}`}
        />
        {errors.currentBalance && (
          <p role="alert" className="text-red-500">{errors.currentBalance}</p>
        )}
      </div>

      <div>
        <label htmlFor="amountPaid">{isPayment2 ? "Payment 2" : "Payment 1"}</label>
        <input
          id="amountPaid"
          name="amountPaid"
          type="number"
          placeholder="Amount Paid"
          value={form.amountPaid}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        {errors.amountPaid && (
          <p role="alert" className="text-red-500">{errors.amountPaid}</p>
        )}
      </div>

      <div>
        <label htmlFor="paymentDate">Payment Date</label>
        <input
          id="paymentDate"
          name="paymentDate"
          type="date"
          value={form.paymentDate}
          onChange={handleChange}
          readOnly={lockBillingDetails}
          className={`w-full border rounded p-2 ${lockBillingDetails ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""}`}
        />
        {errors.paymentDate && (
          <p role="alert" className="text-red-500">{errors.paymentDate}</p>
        )}
      </div>

      {showPaymentMethod && <div>
        <label htmlFor="paymentMethod">Payment Method</label>
        <input
          id="paymentMethod"
          name="paymentMethod"
          type="text"
          placeholder="Payment Method"
          value={form.paymentMethod}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        {errors.paymentMethod && (
          <p role="alert" className="text-red-500">{errors.paymentMethod}</p>
        )}
      </div>}

      <div className="bg-gray-100 rounded p-4">
        <p><strong>Remaining Balance:</strong> {remainingBalance}</p>
        <p><strong>Payment Status:</strong> {paymentStatus}</p>
      </div>

      <button disabled={submitting} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Recording payment..." : "Record Payment"}</button>
    </form>
  );
}

export default PaymentForm;
