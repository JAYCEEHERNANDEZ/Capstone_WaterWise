import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchAllPuroksMonthlyHistory, fetchAllPuroksYearlyHistory } from "../services/consumptionAPI";

const PUROKS = Array.from({ length: 6 }, (_, index) => `Purok ${index + 1}`);
const COLORS = ["#0284c7", "#4f46e5", "#0891b2", "#0d9488", "#7c3aed", "#2563eb"];
const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? [];

function normalize(response, periodKey) {
  const records = unwrap(response);
  if (!Array.isArray(records)) return [];

  return records.map((record) => ({
    purok: record?.purok,
    historical: (Array.isArray(record?.historical) ? record.historical : [])
      .map((item) => ({ period: item?.[periodKey], consumption: Number(item?.consumption ?? 0) }))
      .filter((item) => item.period !== undefined && Number.isFinite(item.consumption))
      .slice(-4),
  }));
}

function PurokGraph({ color, data, purok }) {
  const total = data.reduce((sum, item) => sum + item.consumption, 0);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900">{purok}</h3>
          <p className="mt-1 text-xs text-slate-500">4-period total: {total.toLocaleString("en-PH", { maximumFractionDigits: 2 })} m³</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><TrendingUp className="h-4 w-4" /></span>
      </div>

      {data.length > 0 ? (
        <div aria-label={`${purok} historical consumption graph`} className="mt-4 h-52">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ left: -16, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} width={58} />
              <Tooltip formatter={(amount) => [`${Number(amount).toLocaleString("en-PH", { maximumFractionDigits: 2 })} m³`, "Consumption"]} />
              <Line activeDot={{ r: 6 }} dataKey="consumption" dot={{ fill: color, r: 4 }} name="Historical consumption" stroke={color} strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 flex h-52 items-center justify-center rounded-xl bg-slate-50 px-5 text-center text-xs text-slate-500">No historical consumption recorded for this purok.</div>
      )}
    </article>
  );
}

export default function PurokHistoricalConsumptionGraphs() {
  const [period, setPeriod] = useState("monthly");
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const [monthlyResponse, yearlyResponse] = await Promise.all([
        fetchAllPuroksMonthlyHistory(),
        fetchAllPuroksYearlyHistory(),
      ]);
      setMonthly(normalize(monthlyResponse, "month"));
      setYearly(normalize(yearlyResponse, "year"));
      setError("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError?.message ?? "Unable to load purok history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(loadHistory, 0);
    const intervalId = window.setInterval(loadHistory, 15000);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadHistory]);

  const displayedPuroks = useMemo(() => {
    const source = period === "monthly" ? monthly : yearly;
    return PUROKS.map((purok) => ({ purok, historical: source.find((record) => record.purok === purok)?.historical ?? [] }));
  }, [monthly, period, yearly]);

  return (
    <section aria-labelledby="purok-consumption-title" className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">Community history</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900" id="purok-consumption-title">Consumption per Purok</h2>
          <p className="mt-1 text-sm text-slate-500">Latest four historical periods for each of the six puroks.</p>
        </div>
        <div aria-label="Purok consumption period" className="inline-flex w-fit rounded-xl bg-slate-100 p-1" role="group">
          {["monthly", "yearly"].map((option) => (
            <button aria-pressed={period === option} className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${period === option ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`} key={option} onClick={() => setPeriod(option)} type="button">{option}</button>
          ))}
        </div>
      </div>

      {loading && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{PUROKS.map((purok) => <div className="h-72 animate-pulse rounded-2xl bg-slate-200" key={purok} />)}</div>}
      {!loading && error && <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}
      {!loading && !error && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{displayedPuroks.map((record, index) => <PurokGraph color={COLORS[index]} data={record.historical} key={record.purok} purok={record.purok} />)}</div>}
    </section>
  );
}
