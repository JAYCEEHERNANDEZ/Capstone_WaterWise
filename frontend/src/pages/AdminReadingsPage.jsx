import { useCallback, useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, Search, Users } from "lucide-react";
import MeterReadingTable from "../components/MeterReadingTable";
import { fetchAdminMeterReadings } from "../services/meterReadingAPI";

export default function AdminReadingsPage() {
  const [query, setQuery] = useState("");
  const [purok, setPurok] = useState("all");
  const [allReadings, setAllReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAllReadings(await fetchAdminMeterReadings());
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load consumption records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => fetchAdminMeterReadings()
      .then((records) => {
        if (active) setAllReadings(records);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load consumption records.");
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

  const readings = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allReadings.filter((reading) => {
      const matchesQuery = !term || [reading.consumerNo, reading.consumerName, reading.purok].some((value) => String(value).toLowerCase().includes(term));
      return matchesQuery && (purok === "all" || reading.purok === purok);
    });
  }, [allReadings, purok, query]);

  const total = readings.reduce((sum, reading) => sum + Number(reading.consumption || 0), 0);
  const average = readings.length ? total / readings.length : 0;
  const highest = readings.reduce((maximum, reading) => Math.max(maximum, Number(reading.consumption || 0)), 0);

  const metrics = [
    { Icon: Users, label: "Visible readings", value: readings.length, tone: "bg-indigo-100 text-indigo-700" },
    { Icon: Droplets, label: "Total consumption", value: `${total.toLocaleString()} m³`, tone: "bg-sky-100 text-sky-700" },
    { Icon: Gauge, label: "Average usage", value: `${average.toFixed(1)} m³`, tone: "bg-emerald-100 text-emerald-700" },
    { Icon: Gauge, label: "Highest usage", value: `${highest.toLocaleString()} m³`, tone: "bg-amber-100 text-amber-700" },
  ];

  return (
    <main className="space-y-6">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              Read-only records
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              Consumer consumption readings
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
              Review meter movements and recorded water use across every purok.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map(({ Icon, label, value, tone }) => (
              <article
                className="min-w-28 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur"
                key={label}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {label}
                  </p>
                </div>
                <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Search consumption readings</span><Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" onChange={(event) => setQuery(event.target.value)} placeholder="Search consumer number, name, or purok" type="search" value={query} /></label>
        <label><span className="sr-only">Filter by purok</span><select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:w-44" onChange={(event) => setPurok(event.target.value)} value={purok}><option value="all">All puroks</option>{[1, 2, 3, 4, 5].map((number) => <option key={number} value={`Purok ${number}`}>Purok {number}</option>)}</select></label>
      </section>

      {error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadReadings} type="button">Try again</button></div>}
      {loading ? <div className="grid gap-3">{[1, 2, 3].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div> : <MeterReadingTable readOnly readings={readings} />}
    </main>
  );
}
