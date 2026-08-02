import { useCallback, useEffect, useMemo, useState } from "react";
import BillingHistoryTable from "../components/BillingHistoryTable";
import BillingSummaryCard from "../components/BillingSummaryCard";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageHeader from "../components/PageHeader";
import Search from "../components/Search";
import { fetchBillingHistory } from "../services/billingAPI";

export default function BillingManagementPage() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBillingHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setBillingHistory(await fetchBillingHistory());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError.message ??
          "Unable to load billing history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetchBillingHistory()
        .then((records) => {
          if (active) {
            setBillingHistory(records);
            setError("");
          }
        })
        .catch((requestError) => {
          if (active) {
            setError(
              requestError?.response?.data?.message ??
                requestError.message ??
                "Unable to load billing history.",
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

  const visibleHistory = useMemo(() => {
    const term = query.trim().toLowerCase();

    return billingHistory.filter((record) => {
      const matchesQuery =
        !term ||
        [
          record.invoiceNumber,
          record.consumerName,
          record.purok,
          record.billingPeriod,
        ].some((value) => String(value).toLowerCase().includes(term));

      return matchesQuery && (status === "all" || record.status === status);
    });
  }, [billingHistory, query, status]);

  return (
    <main className="space-y-5 sm:space-y-6">
      <PageHeader
        description="Review billing periods, water usage, account balances, and collection status."
        eyebrow="Billing administration"
        title="Billing management"
      />

      <BillingSummaryCard billingData={billingHistory} />

      <div
        aria-label="Billing table controls"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <Search
          ariaLabel="Search billing history"
          className="flex-1"
          onValueChange={setQuery}
          placeholder="Search consumer, invoice, or period"
          value={query}
        />
        <Filter
          ariaLabel="Filter billing status"
          className="w-full sm:w-48"
          onValueChange={setStatus}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Paid", value: "Paid" },
            { label: "Partially paid", value: "Partially Paid" },
            { label: "Unpaid", value: "Unpaid" },
          ]}
          value={status}
        />
      </div>

      {error && (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="min-h-11 font-bold underline" onClick={loadBillingHistory} type="button">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton label="Loading billing records" variant="table" />
      ) : (
        <BillingHistoryTable historyData={visibleHistory} />
      )}
    </main>
  );
}
