import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchMonthlyHistory, fetchYearlyHistory } from "../services/consumptionAPI";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? [];
const value = (record) => Number(record?.consumption ?? record?.totalConsumption ?? record?.total_consumption ?? record?.value ?? 0);

function HistoryGraph({ data, dataKey, title }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ left: 4, right: 16, top: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey={dataKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit=" m³" width={72} />
            <Tooltip formatter={(amount) => [`${Number(amount).toLocaleString("en-PH")} m³`, "Consumption"]} />
            <Line dataKey="consumption" dot={{ r: 4 }} name="Historical consumption" stroke="#0284c7" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function HistoricalConsumptionGraphs() {
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([fetchMonthlyHistory(), fetchYearlyHistory()]).then(([monthlyResponse, yearlyResponse]) => {
      if (!active) return;
      setMonthly((Array.isArray(unwrap(monthlyResponse)) ? unwrap(monthlyResponse) : []).map((record) => ({ ...record, consumption: value(record) })));
      setYearly((Array.isArray(unwrap(yearlyResponse)) ? unwrap(yearlyResponse) : []).map((record) => ({ ...record, consumption: value(record) })));
    }).catch(() => {
      if (active) { setMonthly([]); setYearly([]); }
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <HistoryGraph data={monthly} dataKey="month" title="Monthly historical consumption" />
      <HistoryGraph data={yearly} dataKey="year" title="Yearly historical consumption" />
    </div>
  );
}
