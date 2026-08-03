import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchMonthlyHistory, fetchYearlyHistory } from "../services/consumptionAPI";
import ChartTooltip from "./ChartTooltip";
import LoadingSkeleton from "./LoadingSkeleton";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? [];
const value = (record) => Number(record?.consumption ?? record?.totalConsumption ?? record?.total_consumption ?? record?.value ?? 0);

function HistoryGraph({ data, dataKey, title }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ left: 4, right: 16, top: 8 }}>
            <defs><linearGradient id="historyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0284C7" stopOpacity={0.16} /><stop offset="100%" stopColor="#0284C7" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid stroke="#DCE5EA" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={dataKey} tick={{ fill: "#52697A", fontSize: 12, fontWeight: 600 }} tickLine={false} />
            <YAxis tick={{ fill: "#52697A", fontSize: 11, fontWeight: 600 }} tickLine={false} width={64} />
            <Tooltip content={<ChartTooltip valueLabel="consumption" />} cursor={{ stroke: "#94A3B8", strokeWidth: 1 }} />
            <Area activeDot={{ fill: "#0284C7", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }} dataKey="consumption" dot={{ fill: "#FFFFFF", r: 3.5, stroke: "#0284C7", strokeWidth: 2 }} fill="url(#historyFill)" name="Historical consumption" stroke="#0284C7" strokeWidth={2.5} type="linear" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function HistoricalConsumptionGraphs() {
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchMonthlyHistory(), fetchYearlyHistory()]).then(([monthlyResponse, yearlyResponse]) => {
      if (!active) return;
      setMonthly((Array.isArray(unwrap(monthlyResponse)) ? unwrap(monthlyResponse) : []).map((record) => ({ ...record, consumption: value(record) })));
      setYearly((Array.isArray(unwrap(yearlyResponse)) ? unwrap(yearlyResponse) : []).map((record) => ({ ...record, consumption: value(record) })));
    }).catch(() => {
      if (active) { setMonthly([]); setYearly([]); }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {loading ? (
        <><LoadingSkeleton label="Loading monthly historical consumption" variant="chart-panel" /><LoadingSkeleton label="Loading yearly historical consumption" variant="chart-panel" /></>
      ) : (
        <><HistoryGraph data={monthly} dataKey="month" title="Monthly Historical Consumption" /><HistoryGraph data={yearly} dataKey="year" title="Yearly Historical Consumption" /></>
      )}
    </div>
  );
}
