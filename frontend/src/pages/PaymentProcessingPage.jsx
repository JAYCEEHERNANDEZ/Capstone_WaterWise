import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, ReceiptText } from "lucide-react";
import ConsumerInfoGrid from "../components/ConsumerInfoGrid";
import CurrentBalanceCard from "../components/CurrentBalanceCard";
import DigitalReceiptModal from "../components/DigitalReceiptModal";
import PaymentForm from "../components/PaymentForm";
import { fetchBillingHistory } from "../services/billingAPI";
import {
  fetchPaymentHistory,
  recordPayment as recordPaymentRequest,
} from "../services/paymentAPI";

export default function PaymentProcessingPage() {
  const [payments, setPayments] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [billings, paymentHistory] = await Promise.all([
        fetchBillingHistory(),
        fetchPaymentHistory(),
      ]);
      setBillingRecords(billings);
      setPayments(paymentHistory.map((payment) => {
        const billing = billings.find((record) => record.id === payment.billingId);
        return {
          ...payment,
          consumerName: billing?.consumerName ?? payment.consumerName,
          address: billing?.address ?? "",
        };
      }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load payment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => Promise.all([fetchBillingHistory(), fetchPaymentHistory()])
      .then(([billings, paymentHistory]) => {
        if (active) {
          setBillingRecords(billings);
          setPayments(paymentHistory.map((payment) => {
            const billing = billings.find((record) => record.id === payment.billingId);
            return {
              ...payment,
              consumerName: billing?.consumerName ?? payment.consumerName,
              address: billing?.address ?? "",
            };
          }));
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load payment data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    refresh();
    const intervalId = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const recordPayment = async (payment) => {
    const billing = billingRecords.find((record) => record.id === payment.billingId)
      ?? billingRecords.find(
        (record) => record.consumerName.toLowerCase() === payment.consumerName.trim().toLowerCase(),
      );
    if (!billing) {
      setError("No billing record matches that consumer name.");
      setSuccess("");
      return false;
    }

    try {
      setError("");
      setSuccess("");
      const result = await recordPaymentRequest({
        billingId: billing.id,
        amountPaid: payment.amountPaid,
      });
      const savedPayment = {
        ...result.payment,
        consumerName: payment.consumerName,
        billingId: billing.id,
        invoiceNumber: billing.invoiceNumber,
        previousReading: billing.previousReading,
        currentReading: billing.currentReading,
        amountDue: result.payment.amountPaid,
        remainingBalance: Number(result.billing.remaining_balance),
        paymentStatus: result.billing.status,
        name: payment.consumerName,
        address: billing.address,
      };
      setPayments((current) => [savedPayment, ...current]);
      setSelectedPayment(savedPayment);
      setBillingRecords(await fetchBillingHistory());
      setSuccess(`Payment for ${payment.consumerName} was recorded in the database successfully.`);
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to record payment.");
      setSuccess("");
      return false;
    }
  };

  const selectedAddress = selectedPayment?.address ?? "";
  const [purok = "N/A", houseNumber = "N/A"] = selectedAddress.split(",");
  const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0);
  const fullyPaid = payments.filter((payment) => payment.paymentStatus === "Paid").length;

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-6 text-white sm:p-8">
        <span className="ww-eyebrow">Payment administration</span>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div><h2 className="text-3xl font-extrabold tracking-tight">Payment processing</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Record consumer payments, monitor remaining balances, and issue downloadable digital receipts.</p></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><Banknote className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-xl font-extrabold">₱{totalCollected.toLocaleString()}</p><p className="text-xs text-slate-300">Collected</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><ReceiptText className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xl font-extrabold">{payments.length}</p><p className="text-xs text-slate-300">Transactions</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-xl font-extrabold">{fullyPaid}</p><p className="text-xs text-slate-300">Fully paid</p></div>
          </div>
        </div>
      </header>

      {error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadPaymentData} type="button">Try again</button></div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{success}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <ConsumerInfoGrid houseNumber={houseNumber.trim()} name={selectedPayment?.consumerName} purok={purok.trim()} />
        <CurrentBalanceCard amountDue={selectedPayment?.remainingBalance ?? 0} />
      </section>

      <PaymentForm billingRecords={billingRecords} onSubmit={recordPayment} />

      <section className="ww-glass-strong overflow-hidden rounded-[24px]">
        <div className="border-b border-slate-100 p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">Transaction ledger</p><h3 className="mt-1 text-2xl font-extrabold text-slate-900">Payment History</h3><p className="mt-1 text-sm text-slate-500">Payments loaded from the server and newly recorded transactions.</p></div>
        {loading ? (
          <div className="grid gap-3 p-6">{[1, 2, 3].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div>
        ) : payments.length === 0 ? (
          <div className="m-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center sm:m-6"><ReceiptText className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No payments recorded yet.</p><p className="mt-1 text-sm text-slate-500">Completed transactions will appear in this ledger.</p></div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-6"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Consumer</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Receipt</th></tr></thead><tbody className="divide-y divide-slate-100">
            {payments.map((payment) => <tr className="transition hover:bg-sky-50/40" key={payment.id}><td className="px-4 py-4 font-bold text-slate-900">{payment.consumerName}</td><td className="px-3 py-4 font-mono text-xs text-slate-600">{payment.paymentDate}</td><td className="px-3 py-4 text-slate-600">{payment.paymentMethod}</td><td className="px-3 py-4 font-mono font-bold">₱{payment.amountPaid.toLocaleString()}</td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${payment.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{payment.paymentStatus}</span></td><td className="px-3 py-4 text-right"><button className="rounded-lg bg-sky-50 px-3 py-2 font-bold text-sky-700 hover:bg-sky-100" onClick={() => setSelectedPayment(payment)} type="button">View Receipt</button></td></tr>)}
          </tbody></table></div>
        )}
      </section>


      <DigitalReceiptModal isOpen={Boolean(selectedPayment)} onClose={() => setSelectedPayment(null)} receiptData={selectedPayment} />
    </main>
  );
}
