import { useEffect, useState } from "react";
import BillingHistoryTable from "../components/BillingHistoryTable";
import CurrentBillingCard from "../components/CurrentBillingCard";
import OfficialReceiptModal from "../components/OfficialReceiptModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { fetchBillingLedger } from "../services/consumerPortal.service";
import { isCanceledRequest } from "../services/apiClient";

export default function BillingLedger({
  historyData: historyDataProp,
  ledgerAccount: ledgerAccountProp,
  officialReceipt: officialReceiptProp,
}) {
  const usesApi = historyDataProp === undefined;
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState("");
  const [selectedOfficialReceipt, setSelectedOfficialReceipt] = useState(null);

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
  const officialReceipt = usesApi ? ledger?.officialReceipt : officialReceiptProp;
  const pageHeader = (
    <header className="ww-page-header text-white">
      <p className="ww-eyebrow">Resident portal</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Bills and payment history</h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-water-100">
        Check the amount due, payment status, billing periods, and available receipts.
      </p>
    </header>
  );

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

  const handleSelectReceipt = (receipt) => {
    setSelectedOfficialReceipt({
      meterName: officialReceipt?.meterName ?? ledgerAccount.accountId,
      runDate: receipt.readingDate,
      previousReading: Number(receipt.previousReading),
      presentReading: Number(receipt.currentReading),
      baselineBill: Number(receipt.amountDue),
      arrears30Days: 0,
      arrears60Days: 0,
      arrears90Days: 0,
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {pageHeader}

      <CurrentBillingCard
        dueDate={ledgerAccount.dueDate}
        outstandingBalance={ledgerAccount.outstandingBalance}
      />

      <section className="ww-glass-strong rounded-2xl p-4 sm:p-6">
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
          historyData={historyData}
          onSelectReceipt={handleSelectReceipt}
          allowAllReceipts
          receiptLabel="View Official Receipt"
          showConsumerDetails={false}
        />
      </section>

      <OfficialReceiptModal
        isOpen={Boolean(selectedOfficialReceipt)}
        onClose={() => setSelectedOfficialReceipt(null)}
        receiptData={selectedOfficialReceipt}
      />
    </div>
  );
}
