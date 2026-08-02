import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, Clock3, Plus, ReceiptText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import DigitalReceiptModal from "../components/DigitalReceiptModal";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaymentModal from "../components/PaymentModal";
import Search from "../components/Search";
import Table from "../components/Table";
import { fetchBillingHistory } from "../services/billingAPI";
import {
  fetchPaymentHistory,
  recordPayment as recordPaymentRequest,
} from "../services/paymentAPI";

function enrichPayments(paymentHistory, billings) {
  return paymentHistory.map((payment) => {
    const billing = billings.find((record) => record.id === payment.billingId);

    return {
      ...payment,
      address: billing?.address ?? "",
      amountDue: payment.amountPaid,
      consumerName: billing?.consumerName ?? payment.consumerName,
      currentReading: billing?.currentReading ?? 0,
      invoiceNumber: billing?.invoiceNumber ?? `INV-${payment.billingId}`,
      name: billing?.consumerName ?? payment.consumerName,
      previousReading: billing?.previousReading ?? 0,
    };
  });
}

export default function PaymentProcessingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedBillingId = Number(searchParams.get("billingId"));
  const [payments, setPayments] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(
    Boolean(searchParams.get("billingId")),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentQuery, setPaymentQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");

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
      setPayments(enrichPayments(paymentHistory, billings));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError.message ??
          "Unable to load payment data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      Promise.all([fetchBillingHistory(), fetchPaymentHistory()])
        .then(([billings, paymentHistory]) => {
          if (active) {
            setBillingRecords(billings);
            setPayments(enrichPayments(paymentHistory, billings));
            setError("");
          }
        })
        .catch((requestError) => {
          if (active) {
            setError(
              requestError?.response?.data?.message ??
                requestError.message ??
                "Unable to load payment data.",
            );
          }
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

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setError("");
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const recordAnotherPayment = useCallback(() => {
    setError("");
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const openPaymentModal = () => {
    setError("");
    setIsPaymentModalOpen(true);
  };

  const recordPayment = async (payment) => {
    const billing = billingRecords.find((record) => record.id === payment.billingId);
    if (!billing) {
      setError("The selected billing record is no longer available. Select it again.");
      return false;
    }

    try {
      setError("");
      const result = await recordPaymentRequest({
        amountPaid: payment.amountPaid,
        amountTendered: payment.amountTendered,
        billingId: billing.id,
        idempotencyKey: payment.idempotencyKey,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
      });
      const savedPayment = {
        ...result.payment,
        address: billing.address,
        amountDue: result.payment.amountPaid,
        billingId: billing.id,
        consumerName: billing.consumerName,
        currentReading: billing.currentReading,
        invoiceNumber: billing.invoiceNumber,
        name: billing.consumerName,
        paymentStatus: result.billing.status,
        previousReading: billing.previousReading,
        remainingBalance: Number(result.billing.remaining_balance),
      };

      setPayments((current) => [
        savedPayment,
        ...current.filter((existingPayment) => existingPayment.id !== savedPayment.id),
      ]);
      setBillingRecords(await fetchBillingHistory());
      return savedPayment;
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError.message ??
          "Unable to record payment.",
      );
      return false;
    }
  };

  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amountPaid || 0),
    0,
  );
  const fullyPaid = payments.filter((payment) => payment.paymentStatus === "Paid").length;
  const paymentSearchTerm = paymentQuery.trim().toLowerCase();
  const visiblePayments = payments.filter((payment) => {
    const matchesName =
      !paymentSearchTerm ||
      String(payment.consumerName ?? "").toLowerCase().includes(paymentSearchTerm);
    const matchesStatus =
      paymentStatus === "all" || payment.paymentStatus === paymentStatus;

    return matchesName && matchesStatus;
  });

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-5 text-white sm:p-6">
        <span className="ww-eyebrow">Payment administration</span>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Payment processing
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review completed transactions and securely record resident payments.
            </p>
          </div>
          <button
            className="hidden min-h-12 items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white shadow-card transition-colors hover:bg-water-500 disabled:bg-slate-600 disabled:text-slate-300 lg:inline-flex"
            disabled={loading}
            onClick={openPaymentModal}
            type="button"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Record payment
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4">
            <Banknote aria-hidden="true" className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 font-mono text-xl font-extrabold tabular-nums">
              ₱{totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-300">All-time collected</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4">
            <ReceiptText aria-hidden="true" className="h-5 w-5 text-water-300" />
            <p className="mt-3 font-mono text-xl font-extrabold tabular-nums">
              {payments.length}
            </p>
            <p className="text-xs text-slate-300">All transactions</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 font-mono text-xl font-extrabold tabular-nums">{fullyPaid}</p>
            <p className="text-xs text-slate-300">Bills fully paid</p>
          </div>
        </div>
      </header>

      {error && !isPaymentModalOpen && (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="min-h-11 font-bold underline" onClick={loadPaymentData} type="button">
            Try again
          </button>
        </div>
      )}

      <div
        aria-label="Payment history table controls"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <Search
          ariaLabel="Search payment history by resident name"
          className="flex-1"
          onValueChange={setPaymentQuery}
          placeholder="Search resident name"
          value={paymentQuery}
        />
        <Filter
          ariaLabel="Filter payment history by bill status"
          className="w-full sm:w-48"
          onValueChange={setPaymentStatus}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Paid", value: "Paid" },
            { label: "Partially paid", value: "Partially Paid" },
          ]}
          value={paymentStatus}
        />
      </div>

      {loading ? (
        <LoadingSkeleton label="Loading payment history" variant="table" />
      ) : (
        <Table
          ariaLabel="Payment history"
          columns={[
            { key: "consumer", label: "Consumer" },
            { key: "invoice", label: "Invoice" },
            { key: "date", label: "Date" },
            { key: "method", label: "Method" },
            { key: "reference", label: "Reference" },
            { key: "amount", label: "Amount", className: "text-right" },
            { key: "balance", label: "Balance after", className: "text-right" },
            { key: "status", label: "Bill status" },
            { key: "receipt", label: "Receipt", className: "text-right" },
          ]}
          data={visiblePayments}
          emptyDescription={
            payments.length
              ? "No payments match the current search and filter."
              : "Completed transactions will appear in this ledger."
          }
          emptyTitle={payments.length ? "No matching payments" : "No payments recorded yet"}
          getRowKey={(payment) => payment.id}
          rowClassName="transition-colors hover:bg-slate-50"
          tableClassName="w-full min-w-[1120px] text-left text-sm"
          renderRow={(payment) => {
            const paid = payment.paymentStatus === "Paid";
            const StatusIcon = paid ? CheckCircle2 : Clock3;

            return (
              <>
                <td className="px-4 py-4 font-bold text-slate-900">{payment.consumerName}</td>
                <td className="px-4 py-4 font-mono text-xs font-bold text-water-700">
                  {payment.invoiceNumber}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-600">
                  {payment.paymentDate}
                </td>
                <td className="px-4 py-4 text-slate-600">{payment.paymentMethod}</td>
                <td className="px-4 py-4 font-mono text-xs text-slate-600">
                  {payment.referenceNumber || "—"}
                </td>
                <td className="px-4 py-4 text-right font-mono font-bold tabular-nums">
                  ₱{payment.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-4 text-right font-mono font-bold tabular-nums text-slate-700">
                  ₱{payment.remainingBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                      paid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    className="min-h-11 rounded-xl bg-water-50 px-3 font-bold text-water-700 hover:bg-water-100"
                    onClick={() => setSelectedPayment(payment)}
                    type="button"
                  >
                    View receipt
                  </button>
                </td>
              </>
            );
          }}
        />
      )}

      <button
        aria-label="Record a new payment"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-water-600 px-5 font-bold text-white shadow-modal transition-colors hover:bg-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 disabled:bg-water-300 lg:hidden"
        disabled={loading}
        onClick={openPaymentModal}
        type="button"
      >
        <Plus aria-hidden="true" className="h-5 w-5" />
        Record payment
      </button>

      <PaymentModal
        key={`${isPaymentModalOpen ? "open" : "closed"}-${requestedBillingId || "manual"}`}
        billingRecords={billingRecords}
        error={error}
        initialBilling={preselectedBilling}
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onRecordAnother={recordAnotherPayment}
        onSubmit={recordPayment}
        onViewReceipt={setSelectedPayment}
      />
      <DigitalReceiptModal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        receiptData={selectedPayment}
      />
    </main>
  );
}
