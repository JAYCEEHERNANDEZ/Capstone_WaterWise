import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, WalletCards } from "lucide-react";

const emptyPayment = {
  consumerName: "",
  currentBalance: "",
  amountPaid: "",
  paymentDate: "",
  paymentMethod: "Cash",
};

function PaymentStatus({ status }) {
  const config = status === "Paid"
    ? { Icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" }
    : status === "Partially Paid"
      ? { Icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800" }
      : { Icon: AlertCircle, className: "border-red-200 bg-red-50 text-red-700" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.className}`}><config.Icon aria-hidden="true" className="h-3.5 w-3.5" />{status}</span>;
}

function PaymentForm({ onSubmit = () => {}, initialData = null, billingRecords = [], lockBillingDetails = false, showPaymentMethod = true }) {
  const formRef = useRef(null);
  const [form, setForm] = useState(() => initialData ? {
    billingId: initialData.billingId,
    consumerName: initialData.consumerName || "",
    currentBalance: String(initialData.currentBalance || ""),
    amountPaid: String(initialData.amountPaid || ""),
    paymentDate: initialData.paymentDate || new Date().toISOString().split("T")[0],
    paymentMethod: initialData.paymentMethod || "Cash",
  } : emptyPayment);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const balance = Number(form.currentBalance) || 0;
  const paid = Number(form.amountPaid) || 0;
  const selectedBilling = billingRecords.find((record) => record.id === form.billingId);
  const isPayment2 = (selectedBilling?.raw?.payments?.length ?? 0) > 0 || selectedBilling?.status === "Partially Paid";
  const remainingBalance = Math.max(balance - paid, 0);
  const paymentStatus = paid <= 0 ? "Unpaid" : paid >= balance ? "Paid" : "Partially Paid";

  const handleChange = ({ target }) => {
    const { name, value } = target;
    if (name === "consumerName") {
      const billing = billingRecords.find((record) => record.consumerName.toLowerCase() === value.trim().toLowerCase());
      setForm((previous) => ({ ...previous, consumerName: value, billingId: billing?.id, currentBalance: billing ? String(billing.outstandingBalance) : previous.currentBalance }));
      setErrors((previous) => ({ ...previous, consumerName: "", currentBalance: "" }));
      return;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.consumerName.trim()) nextErrors.consumerName = "Select a resident with an unpaid balance.";
    if (!form.currentBalance) nextErrors.currentBalance = "The current balance is required.";
    if (!form.amountPaid) nextErrors.amountPaid = "Enter the amount received.";
    else if (Number(form.amountPaid) <= 0) nextErrors.amountPaid = "The amount must be greater than zero.";
    else if (Number(form.amountPaid) > Number(form.currentBalance)) nextErrors.amountPaid = "The amount cannot exceed the current balance.";
    else if (isPayment2 && Math.round(Number(form.amountPaid) * 100) !== Math.round(Number(form.currentBalance) * 100)) nextErrors.amountPaid = "Payment 2 must equal the remaining balance.";
    if (!form.paymentDate) nextErrors.paymentDate = "Select the payment date.";
    if (showPaymentMethod && !form.paymentMethod.trim()) nextErrors.paymentMethod = "Select a payment method.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const saved = await onSubmit({ ...form, currentBalance: balance, amountPaid: paid, remainingBalance, paymentStatus, billingId: form.billingId });
      if (saved !== false) { setForm(emptyPayment); setErrors({}); }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (name, readOnly = false) => [
    "mt-2 min-h-12 w-full rounded-xl border bg-white px-4 font-mono tabular-nums text-navy-900 outline-none transition-colors placeholder:font-sans placeholder:text-slate-400 focus:ring-4",
    errors[name] ? "border-red-600 focus:border-red-600 focus:ring-red-100" : "border-slate-300 focus:border-water-600 focus:ring-water-100",
    readOnly ? "cursor-not-allowed bg-slate-100 text-slate-600" : "",
  ].join(" ");
  const error = (name) => errors[name] && <p className="mt-1.5 text-sm font-semibold text-red-700" id={`${name}-error`} role="alert">{errors[name]}</p>;
  const accessibility = (name) => ({ "aria-describedby": errors[name] ? `${name}-error` : undefined, "aria-invalid": Boolean(errors[name]) });

  return (
    <form className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" id="payment-form-section" onSubmit={handleSubmit} ref={formRef}>
      <header className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-100 text-water-700"><WalletCards aria-hidden="true" className="h-5 w-5" /></span>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Record payment</h2>
        <p className="mt-1 text-sm text-slate-600">Choose the bill, confirm the amount received, and review the remaining balance.</p>
      </header>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2"><label className="text-sm font-bold text-navy-900" htmlFor="consumerName">Resident</label><input {...accessibility("consumerName")} className={inputClass("consumerName", lockBillingDetails)} id="consumerName" list="billable-consumers" name="consumerName" onChange={handleChange} placeholder="Search resident name" readOnly={lockBillingDetails} type="text" value={form.consumerName} /><datalist id="billable-consumers">{billingRecords.filter((record) => record.outstandingBalance > 0).map((record) => <option key={record.id} value={record.consumerName}>{`Balance: ₱${record.outstandingBalance}`}</option>)}</datalist>{error("consumerName")}</div>
        <div><label className="text-sm font-bold text-navy-900" htmlFor="currentBalance">Current balance</label><input {...accessibility("currentBalance")} className={inputClass("currentBalance", lockBillingDetails || Boolean(form.billingId))} id="currentBalance" inputMode="decimal" name="currentBalance" onChange={handleChange} placeholder="0.00" readOnly={lockBillingDetails || Boolean(form.billingId)} step="0.01" type="number" value={form.currentBalance} />{error("currentBalance")}</div>
        <div><label className="text-sm font-bold text-navy-900" htmlFor="amountPaid">{isPayment2 ? "Payment 2 amount" : "Amount received"}</label><input {...accessibility("amountPaid")} className={inputClass("amountPaid")} id="amountPaid" inputMode="decimal" min="0" name="amountPaid" onChange={handleChange} placeholder="0.00" step="0.01" type="number" value={form.amountPaid} />{error("amountPaid")}</div>
        <div><label className="text-sm font-bold text-navy-900" htmlFor="paymentDate">Payment date</label><input {...accessibility("paymentDate")} className={inputClass("paymentDate", lockBillingDetails)} id="paymentDate" name="paymentDate" onChange={handleChange} readOnly={lockBillingDetails} type="date" value={form.paymentDate} />{error("paymentDate")}</div>
        {showPaymentMethod && <div><label className="text-sm font-bold text-navy-900" htmlFor="paymentMethod">Payment method</label><select {...accessibility("paymentMethod")} className={inputClass("paymentMethod")} id="paymentMethod" name="paymentMethod" onChange={handleChange} value={form.paymentMethod}><option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Bank transfer">Bank transfer</option></select>{error("paymentMethod")}</div>}

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 sm:grid-cols-2">
          <div><p className="text-xs font-semibold text-slate-500">Remaining balance</p><p className="mt-1 font-mono text-xl font-extrabold tabular-nums text-navy-900">₱{remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></div>
          <div className="sm:text-right"><p className="mb-2 text-xs font-semibold text-slate-500">Payment status</p><PaymentStatus status={paymentStatus} /></div>
        </div>
        <div className="sm:col-span-2"><button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white transition-colors hover:bg-water-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit"><WalletCards aria-hidden="true" className="h-4 w-4" />{submitting ? "Recording payment…" : "Record payment"}</button></div>
      </div>
    </form>
  );
}

export default PaymentForm;
