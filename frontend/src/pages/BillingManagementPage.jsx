import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleDollarSign, TrendingUp, WalletCards } from "lucide-react";
import BillingHistoryTable from "../components/BillingHistoryTable";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import BillingSummaryCard from "../components/BillingSummaryCard";
import DigitalReceiptModal from "../components/DigitalReceiptModal";
import PaymentForm from "../components/PaymentForm";
import Search from "../components/Search";
import { fetchBillingHistory } from "../services/billingAPI";
import { recordPayment as recordPaymentRequest } from "../services/paymentAPI";

export default function BillingManagementPage() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentRecord, setPaymentRecord] = useState(null);

  const loadBillingHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setBillingHistory(await fetchBillingHistory());
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load billing history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => fetchBillingHistory()
      .then((records) => {
        if (active) {
          setBillingHistory(records);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load billing history.");
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

  const visibleHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    return billingHistory.filter((record) => {
      const matchesQuery = !term || [record.invoiceNumber, record.consumerName, record.purok, record.billingPeriod, record.status].some((value) => String(value).toLowerCase().includes(term));
      return matchesQuery && (status === "all" || record.status === status);
    });
  }, [billingHistory, query, status]);

  const totalBilled = billingHistory.reduce((sum, record) => sum + Number(record.amountDue || 0), 0);
  const outstanding = billingHistory.reduce((sum, record) => sum + Number(record.outstandingBalance || 0), 0);
  const collected = Math.max(totalBilled - outstanding, 0);
  const collectionRate = totalBilled ? (collected / totalBilled) * 100 : 0;

  const handleRecordPayment = async (payment) => {
    try {
      setError("");
      setSuccess("");
      const billing = billingHistory.find((record) => record.id === payment.billingId)
        ?? billingHistory.find(
          (record) => record.consumerName.toLowerCase() === payment.consumerName.trim().toLowerCase(),
        );
      if (!billing) throw new Error("No billing record matches that consumer name.");
      const result = await recordPaymentRequest({
        billingId: billing.id,
        amountPaid: payment.amountPaid,
      });
      await loadBillingHistory();
      setPaymentRecord(null);
      setSuccess(`Payment #${result.payment.id} for ${payment.consumerName} was saved to the database successfully.`);
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to record payment.");
      setSuccess("");
      return false;
    }
  };

  const handlePayBalance = (record) => {
    setPaymentRecord(record);
  };

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-5 text-white sm:p-6">
        <span className="ww-eyebrow">Billing administration</span>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Billing and payment management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Track bill status, collection progress, account balances, and payment receipts across the community.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><CircleDollarSign className="h-5 w-5 text-water-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">₱{totalBilled.toLocaleString()}</p><p className="text-xs text-slate-300">Total billed</p></div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><WalletCards className="h-5 w-5 text-red-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">₱{outstanding.toLocaleString()}</p><p className="text-xs text-slate-300">Outstanding</p></div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><TrendingUp className="h-5 w-5 text-emerald-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">{collectionRate.toFixed(0)}%</p><p className="text-xs text-slate-300">Collected</p></div>
          </div>
        </div>
      </header>

      <BillingSummaryCard billingData={billingHistory} />

      <section className="ww-glass-strong overflow-hidden rounded-2xl">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">Account records</p><h3 className="mt-1 text-2xl font-extrabold text-slate-900">Record Billing</h3><p className="mt-1 text-sm text-slate-500">Review consumer names, puroks, billing periods, usage, amounts, and receipts.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Search ariaLabel="Search billing history" className="sm:w-80" onValueChange={setQuery} placeholder="Search consumer, invoice, or period" value={query} />
              <Filter ariaLabel="Filter billing status" className="sm:w-48" onValueChange={setStatus} options={[{ label: "All statuses", value: "all" }, { label: "Paid", value: "Paid" }, { label: "Partially paid", value: "Partially Paid" }, { label: "Unpaid", value: "Unpaid" }]} value={status} />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {error && <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadBillingHistory} type="button">Try again</button></div>}
          {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{success}</div>}
          {loading ? <LoadingSkeleton label="Loading billing records" variant="table" /> : <BillingHistoryTable historyData={visibleHistory} onSelectReceipt={setSelectedReceipt} onPayBalance={handlePayBalance} />}
        </div>
      </section>

      <DigitalReceiptModal isOpen={Boolean(selectedReceipt)} onClose={() => setSelectedReceipt(null)} receiptData={selectedReceipt} />
      <PaymentModal isOpen={Boolean(paymentRecord)} onClose={() => setPaymentRecord(null)} record={paymentRecord} onSubmit={handleRecordPayment} billingHistory={billingHistory} />
    </main>
  );
}

function PaymentModal({ isOpen, onClose, record, onSubmit, billingHistory }) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-raised" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <PaymentForm
          billingRecords={billingHistory}
          lockBillingDetails
          onSubmit={onSubmit}
          showPaymentMethod={false}
          initialData={{
            consumerName: record.consumerName,
            billingId: record.id,
            currentBalance: record.outstandingBalance,
            amountPaid: "",
            paymentDate: new Date().toISOString().split("T")[0],
            paymentMethod: "Cash",
          }}
        />
      </div>
    </div>
  );
}
