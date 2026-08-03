import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BillingHistoryTable from "../components/BillingHistoryTable";
import ConsumptionReceiptModal from "../components/ConsumptionReceiptModal";
import CurrentBillingCard from "../components/CurrentBillingCard";
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
  const displayedHistoryData = selectedBill
    ? [selectedBill, ...historyData.filter((record) => record.id !== selectedBill.id)]
    : historyData;
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

      <section className="ww-glass-strong rounded-2xl p-4 sm:p-6" id="consumer-billing-history">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-water-600">
              Your records
            </p>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-navy-900 sm:text-2xl">
              Bill history
            </h3>
          </div>
        </div>

        <BillingHistoryTable
          historyData={displayedHistoryData}
          highlightedBillingId={requestedBillingId}
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
