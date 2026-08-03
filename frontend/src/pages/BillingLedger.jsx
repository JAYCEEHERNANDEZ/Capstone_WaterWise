import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BillingHistoryTable from "../components/BillingHistoryTable";
import ConsumptionReceiptModal from "../components/ConsumptionReceiptModal";
import CurrentBillingCard from "../components/CurrentBillingCard";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import PaymentReceiptModal from "../components/PaymentReceiptModal";
import { fetchBillingLedger } from "../services/consumerPortal.service";
import { isCanceledRequest } from "../services/apiClient";

const formatReceiptDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: String(value).includes("T") ? "short" : undefined,
    timeZone: String(value).includes("T") ? "Asia/Manila" : "UTC",
  }).format(date);
};

const consumptionReceipt = (bill, consumerName, billings) => {
  if (!bill) return null;
  const readingTime = Date.parse(`${bill.readingDate}T00:00:00Z`);
  const arrears = billings.reduce((totals, record) => {
    const balance = Number(record.remainingBalance ?? 0);
    if (record.id === bill.id || record.status === "Paid" || balance <= 0 || !record.dueDate) {
      return totals;
    }
    const overdueDays = Math.floor(
      (readingTime - Date.parse(`${record.dueDate}T00:00:00Z`)) / 86_400_000,
    );
    if (overdueDays >= 90) totals.arrears90Days += balance;
    else if (overdueDays >= 60) totals.arrears60Days += balance;
    else if (overdueDays >= 30) totals.arrears30Days += balance;
    return totals;
  }, { arrears30Days: 0, arrears60Days: 0, arrears90Days: 0 });

  return {
    meterName: consumerName,
    runDate: formatReceiptDate(bill.createdAt ?? bill.readingDate),
    previousReading: bill.previousReading,
    presentReading: bill.currentReading,
    baselineBill: bill.amountDue,
    ...arrears,
  };
};

export default function BillingLedger({
  historyData: historyDataProp,
  ledgerAccount: ledgerAccountProp,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const usesApi = historyDataProp === undefined;
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [receiptError, setReceiptError] = useState("");

  useEffect(() => {
    if (!usesApi) return undefined;

    const controller = new AbortController();
    fetchBillingLedger({ signal: controller.signal })
      .then(setLedger)
      .catch((requestError) => {
        if (!isCanceledRequest(requestError)) setError(requestError.message);
      });

    return () => controller.abort();
  }, [usesApi]);

  const historyData = usesApi ? ledger?.historyData ?? [] : historyDataProp;
  const ledgerAccount = usesApi ? ledger?.ledgerAccount : ledgerAccountProp;
  const requestedBillingId = Number(searchParams.get("billingId"));
  const requestedPaymentId = Number(searchParams.get("paymentId"));
  const requestedView = searchParams.get("view");
  const selectedBill = historyData.find((record) => record.id === requestedBillingId);
  const selectedPayment = ledger?.payments?.find((record) => record.id === requestedPaymentId);
  const periodOptions = [...new Set(historyData.map((record) => record.billingPeriod))];
  const hasActiveFilters = periodFilter !== "all" || statusFilter !== "all";
  const filteredHistoryData = historyData.filter((record) =>
    (periodFilter === "all" || record.billingPeriod === periodFilter) &&
    (statusFilter === "all" || record.status === statusFilter),
  );
  const displayedHistoryData = selectedBill && filteredHistoryData.includes(selectedBill)
    ? [selectedBill, ...filteredHistoryData.filter((record) => record.id !== selectedBill.id)]
    : filteredHistoryData;
  const selectedConsumptionReceipt = consumptionReceipt(
    selectedBill,
    ledgerAccount?.name,
    historyData,
  );
  const pageHeader = <PageHeader description="Check the amount due, payment status, billing periods, and remaining balances." eyebrow="Resident portal" title="Bills and payment history" />;

  useEffect(() => {
    if (!ledger || !requestedBillingId || requestedView) return;
    document.getElementById("consumer-billing-history")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [ledger, requestedBillingId, requestedView]);

  const closeRelatedModal = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("view");
    nextParams.delete("paymentId");
    setSearchParams(nextParams, { replace: true });
  };

  const openReceipt = (bill) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("billingId", String(bill.id));
    setReceiptError("");

    if (bill.status === "Paid") {
      const billPayments = ledger?.payments?.filter((record) => record.billingId === bill.id) ?? [];
      const payment = billPayments.find((record) => Number(record.balanceAfterPayment ?? record.remainingBalance) === 0)
        ?? billPayments[0];
      if (!payment) {
        setReceiptError("The payment receipt for this paid bill is unavailable.");
        return;
      }
      nextParams.set("paymentId", String(payment.id));
      nextParams.set("view", "payment-receipt");
    } else {
      nextParams.delete("paymentId");
      nextParams.set("view", "consumption-receipt");
    }

    setSearchParams(nextParams);
  };

  if (error) {
    return (
      <div className="space-y-5">
        {pageHeader}
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</div>
      </div>
    );
  }

  if (!ledgerAccount) {
    return (
      <div className="space-y-5">
        {pageHeader}
        <LoadingSkeleton label="Loading billing ledger" variant="billing" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {pageHeader}

      <CurrentBillingCard
        dueDate={ledgerAccount.dueDate}
        outstandingBalance={ledgerAccount.outstandingBalance}
      />

      <section className="space-y-4" id="consumer-billing-history">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">
              Your records
            </p>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-navy-900 sm:text-2xl">
              Bill history
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Showing {displayedHistoryData.length} of {historyData.length} bill{historyData.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
            <Filter
              ariaLabel="Filter bills by billing period"
              className="w-full sm:w-52"
              onValueChange={setPeriodFilter}
              options={[
                { label: "All billing periods", value: "all" },
                ...periodOptions.map((period) => ({ label: period, value: period })),
              ]}
              value={periodFilter}
            />
            <Filter
              ariaLabel="Filter bills by status"
              className="w-full sm:w-48"
              onValueChange={setStatusFilter}
              options={[
                { label: "All statuses", value: "all" },
                { label: "Paid", value: "Paid" },
                { label: "Partially paid", value: "Partially Paid" },
                { label: "Unpaid", value: "Unpaid" },
              ]}
              value={statusFilter}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-water-700 hover:bg-water-50"
            onClick={() => {
              setPeriodFilter("all");
              setStatusFilter("all");
            }}
            type="button"
          >
            Clear filters
          </button>
        )}

        {receiptError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
            {receiptError}
          </div>
        )}

        <BillingHistoryTable
          emptyDescription={hasActiveFilters ? "Adjust or clear the billing period and status filters to see other records." : "Your billing records will appear here after a meter reading is recorded."}
          emptyTitle={hasActiveFilters ? "No bills match these filters" : "No billing records"}
          historyData={displayedHistoryData}
          highlightedBillingId={requestedBillingId}
          onViewReceipt={openReceipt}
          showConsumerDetails={false}
        />
      </section>

      <ConsumptionReceiptModal
        isOpen={requestedView === "consumption-receipt" && Boolean(selectedConsumptionReceipt)}
        onClose={closeRelatedModal}
        receiptData={selectedConsumptionReceipt}
        residentName={ledgerAccount.name}
      />
      <PaymentReceiptModal
        isOpen={requestedView === "payment-receipt" && Boolean(selectedPayment)}
        onClose={closeRelatedModal}
        receiptData={selectedPayment}
      />
    </div>
  );
}
