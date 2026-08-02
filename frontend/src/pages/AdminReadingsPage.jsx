import { useCallback, useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, Users } from "lucide-react";
import MeterReadingTable from "../components/MeterReadingTable";
import Filter from "../components/Filter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import KPI from "../components/KPI";
import PageHeader from "../components/PageHeader";
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

  return (
    <main className="space-y-6">
      <PageHeader description="Review meter movements and recorded water use across every purok." eyebrow="Read-only records" title="Consumer consumption readings" />

      <section aria-label="Reading summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPI description="Matches the current filters" icon={Users} title="Visible readings" value={readings.length} />
        <KPI description="Across visible records" icon={Droplets} title="Total consumption" unit="m³" value={total.toLocaleString()} />
        <KPI description="Per visible reading" icon={Gauge} title="Average usage" unit="m³" value={average.toFixed(1)} />
        <KPI description="Highest visible record" icon={Gauge} title="Highest usage" unit="m³" value={highest.toLocaleString()} />
      </section>

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
