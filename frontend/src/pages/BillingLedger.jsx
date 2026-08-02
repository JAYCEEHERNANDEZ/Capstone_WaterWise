import { useEffect, useState } from "react";
import BillingHistoryTable from "../components/BillingHistoryTable";
import CurrentBillingCard from "../components/CurrentBillingCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import { fetchBillingLedger } from "../services/consumerPortal.service";
import { isCanceledRequest } from "../services/apiClient";

export default function BillingLedger({
  historyData: historyDataProp,
  ledgerAccount: ledgerAccountProp,
}) {
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
  const pageHeader = <PageHeader description="Check the amount due, payment status, billing periods, and remaining balances." eyebrow="Resident portal" title="Bills and payment history" />;

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
          showConsumerDetails={false}
        />
      </section>
    </div>
  );
}
