import { useCallback, useEffect, useMemo, useState } from "react";
import BillingHistoryTable from "../components/BillingHistoryTable";
import BillingSummaryCard from "../components/BillingSummaryCard";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
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
      <header className="ww-page-header p-5 text-white sm:p-6">
        <span className="ww-eyebrow">Billing administration</span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Billing management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Review billing periods, water usage, account balances, and collection status.
        </p>
      </header>

      <BillingSummaryCard billingData={billingHistory} />

      <div
        aria-label="Billing table controls"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
        role="search"
      >
        <Search
          ariaLabel="Search billing history"
          className="w-full sm:w-80"
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

      <section className="ww-glass-strong rounded-2xl p-4 sm:p-6" aria-label="Billing records">
        {error && (
          <div
            className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
      </section>
    </main>
  );
}
