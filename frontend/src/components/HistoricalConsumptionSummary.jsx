import { useEffect, useState } from "react";
import { AlertCircle, CalendarDays, Droplets } from "lucide-react";
import { fetchMonthlyHistory, fetchYearlyHistory } from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? [];
const consumptionValue = (record) => Number(record?.consumption ?? record?.totalConsumption ?? record?.total_consumption ?? record?.value ?? 0);

function HistoryKpi({ Icon, accent, label, records, periodKey, compact }) {
  const latest = records.at(-1);
  return (
    <article className={`relative overflow-hidden rounded-2xl bg-navy-950 p-5 text-white shadow-card ${compact ? "h-48" : "h-56"}`}>
      <div className="relative flex h-full flex-col">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}><Icon className="h-6 w-6" /></span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-water-300">{label}</p>
        <div className="mt-2 flex items-end gap-1">
          <strong className="text-3xl font-extrabold tracking-tight">{consumptionValue(latest).toLocaleString("en-PH", { maximumFractionDigits: 2 })}</strong>
          <span className="mb-1 text-xs font-semibold text-slate-300">m³</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-300">Latest recorded period: {latest?.[periodKey] ?? "No records"}</p>
      </div>
    </article>
  );
}

function HistoryKpiSkeleton({ Icon, label, compact }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl bg-navy-950 p-5 text-white shadow-card ${compact ? "h-48" : "h-56"}`}>
      <div className="relative flex h-full flex-col">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-water-900 text-water-300">
          <Icon aria-hidden="true" className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-water-300">{label}</p>
        <LoadingSkeleton className="mt-3 opacity-30" label={`Loading ${label.toLowerCase()}`} variant="inline" />
      </div>
    </article>
  );
}

export default function HistoricalConsumptionSummary({ className = "grid gap-5 md:grid-cols-2", compact = false }) {
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchMonthlyHistory(), fetchYearlyHistory()])
      .then(([monthlyResponse, yearlyResponse]) => {
        if (!active) return;
        const monthlyData = unwrap(monthlyResponse);
        const yearlyData = unwrap(yearlyResponse);
        setMonthly(Array.isArray(monthlyData) ? monthlyData : []);
        setYearly(Array.isArray(yearlyData) ? yearlyData : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.message ?? "Unable to load historical consumption.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className={className}>
        <HistoryKpiSkeleton compact={compact} Icon={Droplets} label="Monthly consumption" />
        <HistoryKpiSkeleton compact={compact} Icon={CalendarDays} label="Yearly consumption" />
      </div>
    );
  }
  if (error) return <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>;

  return (
    <div className={className}>
      <HistoryKpi compact={compact} Icon={Droplets} accent="bg-water-900 text-water-300" label="Monthly consumption" periodKey="month" records={monthly} />
      <HistoryKpi compact={compact} Icon={CalendarDays} accent="bg-water-900 text-water-300" label="Yearly consumption" periodKey="year" records={yearly} />
    </div>
  );
}
