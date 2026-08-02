import { useCallback, useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, Users } from "lucide-react";
import MeterReadingTable from "../components/MeterReadingTable";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Search from "../components/Search";
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
    { Icon: Users, label: "Visible readings", value: readings.length, tone: "bg-water-100 text-water-700" },
    { Icon: Droplets, label: "Total consumption", value: `${total.toLocaleString()} m³`, tone: "bg-water-100 text-water-700" },
    { Icon: Gauge, label: "Average usage", value: `${average.toFixed(1)} m³`, tone: "bg-emerald-100 text-emerald-700" },
    { Icon: Gauge, label: "Highest usage", value: `${highest.toLocaleString()} m³`, tone: "bg-amber-100 text-amber-700" },
  ];

  return (
    <main className="space-y-6">
      <header className="ww-page-header p-5 text-white sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <span className="inline-flex rounded-full border border-water-700 bg-water-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-water-300">
              Read-only records
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Consumer consumption readings
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
              Review meter movements and recorded water use across every purok.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map(({ Icon, label, value, tone }) => (
              <article
                className="min-w-28 rounded-xl border border-slate-700 bg-navy-900 px-3 py-2.5"
                key={label}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-xl ${tone}`}>
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

      <div
        aria-label="Meter reading table controls"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <Search ariaLabel="Search consumption readings" className="flex-1" onValueChange={setQuery} placeholder="Search consumer number, name, or purok" value={query} />
        <Filter ariaLabel="Filter by purok" className="w-full sm:w-48" onValueChange={setPurok} options={[{ label: "All puroks", value: "all" }, ...[1, 2, 3, 4, 5].map((number) => ({ label: `Purok ${number}`, value: `Purok ${number}` }))]} value={purok} />
      </div>

      {error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadReadings} type="button">Try again</button></div>}
      {loading ? <LoadingSkeleton label="Loading meter readings" variant="table" /> : <MeterReadingTable readOnly readings={readings} />}
    </main>
  );
}
