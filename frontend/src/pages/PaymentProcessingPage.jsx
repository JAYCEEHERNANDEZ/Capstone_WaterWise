import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ConsumerInfoGrid from "../components/ConsumerInfoGrid";
import CurrentBalanceCard from "../components/CurrentBalanceCard";
import DigitalReceiptModal from "../components/DigitalReceiptModal";
import PaymentForm from "../components/PaymentForm";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Table from "../components/Table";
import { fetchBillingHistory } from "../services/billingAPI";
import {
  fetchPaymentHistory,
  recordPayment as recordPaymentRequest,
} from "../services/paymentAPI";

export default function PaymentProcessingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const requestedBillingId = Number(searchParams.get("billingId"));
  const preselectedBilling = billingRecords.find(
    (record) => record.id === requestedBillingId && record.outstandingBalance > 0,
  );

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
    const billing = billingRecords.find((record) => record.id === payment.billingId);
    if (!billing) {
      setError("The selected billing record is no longer available. Refresh and select it again.");
      setSuccess("");
      return false;
    }

    try {
      setError("");
      setSuccess("");
      const result = await recordPaymentRequest({
        billingId: billing.id,
        amountPaid: payment.amountPaid,
        idempotencyKey: payment.idempotencyKey,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
      });
      const savedPayment = {
        ...result.payment,
        consumerName: billing.consumerName,
        billingId: billing.id,
        invoiceNumber: billing.invoiceNumber,
        previousReading: billing.previousReading,
        currentReading: billing.currentReading,
        amountDue: result.payment.amountPaid,
        remainingBalance: Number(result.billing.remaining_balance),
        paymentStatus: result.billing.status,
        name: billing.consumerName,
        address: billing.address,
      };
      setPayments((current) => [
        savedPayment,
        ...current.filter((existingPayment) => existingPayment.id !== savedPayment.id),
      ]);
      setSelectedPayment(savedPayment);
      setBillingRecords(await fetchBillingHistory());
      setSearchParams({}, { replace: true });
      setSuccess(`Payment for ${billing.consumerName} was recorded successfully.`);
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
      <header className="ww-page-header p-5 text-white sm:p-6">
        <span className="ww-eyebrow">Payment administration</span>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Payment processing</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Record resident payments, monitor remaining balances, and issue downloadable digital receipts.</p></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><Banknote className="h-5 w-5 text-emerald-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">₱{totalCollected.toLocaleString()}</p><p className="text-xs text-slate-300">Collected</p></div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><ReceiptText className="h-5 w-5 text-water-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">{payments.length}</p><p className="text-xs text-slate-300">Transactions</p></div>
            <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-3 font-mono text-xl font-extrabold tabular-nums">{fullyPaid}</p><p className="text-xs text-slate-300">Fully paid</p></div>
          </div>
        </div>
      </header>

      {error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadPaymentData} type="button">Try again</button></div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{success}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <ConsumerInfoGrid houseNumber={houseNumber.trim()} name={selectedPayment?.consumerName} purok={purok.trim()} />
        <CurrentBalanceCard amountDue={selectedPayment?.remainingBalance ?? 0} />
      </section>

      <PaymentForm
        key={preselectedBilling?.id ?? "unselected-payment"}
        billingRecords={billingRecords}
        initialData={preselectedBilling ? {
          billingId: preselectedBilling.id,
          consumerName: preselectedBilling.consumerName,
          currentBalance: preselectedBilling.outstandingBalance,
        } : null}
        onSubmit={recordPayment}
      />

      <section className="ww-glass-strong overflow-hidden rounded-2xl">
        <div className="border-b border-slate-100 p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">Transaction ledger</p><h3 className="mt-1 text-2xl font-extrabold text-slate-900">Payment History</h3><p className="mt-1 text-sm text-slate-500">Payments loaded from the server and newly recorded transactions.</p></div>
        {loading ? (
          <LoadingSkeleton className="p-4 sm:p-6" label="Loading payment history" variant="table" />
        ) : (
          <div className="p-4 sm:p-6"><Table ariaLabel="Payment history" className="shadow-none" columns={[{ key: "consumer", label: "Consumer" }, { key: "date", label: "Date" }, { key: "method", label: "Method" }, { key: "reference", label: "Reference" }, { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "receipt", label: "Receipt", className: "text-right" }]} data={payments} emptyDescription="Completed transactions will appear in this ledger." emptyTitle="No payments recorded yet" getRowKey={(payment) => payment.id} rowClassName="transition-colors hover:bg-slate-50" tableClassName="w-full min-w-[900px] text-left text-sm" renderRow={(payment) => {
            const paid = payment.paymentStatus === "Paid";
            const StatusIcon = paid ? CheckCircle2 : Clock3;
            return <><td className="px-4 py-4 font-bold text-slate-900">{payment.consumerName}</td><td className="px-4 py-4 font-mono text-xs text-slate-600">{payment.paymentDate}</td><td className="px-4 py-4 text-slate-600">{payment.paymentMethod}</td><td className="px-4 py-4 font-mono text-xs text-slate-600">{payment.referenceNumber || "—"}</td><td className="px-4 py-4 font-mono font-bold">₱{payment.amountPaid.toLocaleString()}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}><StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />{payment.paymentStatus}</span></td><td className="px-4 py-4 text-right"><button className="min-h-11 rounded-xl bg-water-50 px-3 font-bold text-water-700 hover:bg-water-100" onClick={() => setSelectedPayment(payment)} type="button">View Receipt</button></td></>;
          }} /></div>
        )}
      </section>


      <DigitalReceiptModal isOpen={Boolean(selectedPayment)} onClose={() => setSelectedPayment(null)} receiptData={selectedPayment} />
    </main>
  );
}
