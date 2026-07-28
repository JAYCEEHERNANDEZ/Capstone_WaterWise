import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ConsumerSelectionList from "../components/ConsumerSelectionList";
import ConsumptionEntryPanel from "../components/ConsumptionEntryPanel";
import { fetchConsumerDirectory } from "../services/consumerDirectoryAPI";
import { createMeterReading, fetchMeterReadings } from "../services/meterReadingAPI";

export default function RecordConsumptionPage() {
  const [consumers, setConsumers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [consumerRecords, readingRecords] = await Promise.all([fetchConsumerDirectory(), fetchMeterReadings()]);
      setConsumers(consumerRecords);
      setReadings(readingRecords);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load consumption entry data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetchConsumerDirectory(), fetchMeterReadings()])
      .then(([consumerRecords, readingRecords]) => {
        if (active) { setConsumers(consumerRecords); setReadings(readingRecords); }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load consumption entry data.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleConsumers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return consumers.filter((consumer) => !term || [consumer.consumerName, consumer.consumerNo, consumer.purok].some((value) => String(value).toLowerCase().includes(term)));
  }, [consumers, query]);

  const latestReading = selectedConsumer
    ? readings.find((reading) => reading.consumerNo === selectedConsumer.consumerNo)
    : null;

  const saveReading = async (payload) => {
    try {
      setSaving(true); setError(""); setSuccess("");
      await createMeterReading(payload);
      setSuccess(`Consumption for ${payload.consumerName} was recorded successfully.`);
      setReadings(await fetchMeterReadings());
      setSelectedConsumer(null);
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to save the reading.");
      return false;
    } finally { setSaving(false); }
  };

  return (
    <main className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Meter Reader Workspace</p><h2 className="mt-3 text-3xl font-extrabold">Record Consumption Entry</h2><p className="mt-2 text-sm text-slate-300">Select a consumer and submit the latest water meter reading.</p></header>
      {error && <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadData} type="button">Try again</button></div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{success}</div>}
      {loading ? <div className="grid gap-3">{[1, 2, 3].map((item) => <div className="h-20 animate-pulse rounded-2xl bg-slate-100" key={item} />)}</div> : <div className="w-full"><ConsumerSelectionList consumers={visibleConsumers} onSelect={(consumer) => { setSelectedConsumer(consumer); setError(""); setSuccess(""); }} query={query} selectedId={selectedConsumer?.id} setQuery={setQuery} /></div>}

      {selectedConsumer && (
        <div aria-label="Record consumption dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => !saving && setSelectedConsumer(null)} role="dialog">
          <div className="relative my-auto w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Close record consumption dialog" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50" disabled={saving} onClick={() => setSelectedConsumer(null)} type="button"><X className="h-5 w-5" /></button>
            {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
            <ConsumptionEntryPanel consumer={selectedConsumer} key={`${selectedConsumer.id}-${latestReading?.id ?? "new"}`} onSave={saveReading} previousReading={latestReading?.currentReading ?? 0} saving={saving} />
          </div>
        </div>
      )}
    </main>
  );
}
