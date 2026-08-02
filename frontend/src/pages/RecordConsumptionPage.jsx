import { useCallback, useEffect, useMemo, useState } from "react";
import ConsumerSelectionList from "../components/ConsumerSelectionList";
import ConsumptionEntryPanel from "../components/ConsumptionEntryPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { fetchConsumerDirectory } from "../services/consumerDirectoryAPI";
import { createMeterReading, fetchMeterReadings } from "../services/meterReadingAPI";

export default function RecordConsumptionPage() {
  const toast = useToast();
  const [consumers, setConsumers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      setSaving(true); setError("");
      await createMeterReading(payload);
      toast.success("Meter reading recorded", `${payload.consumerName}'s consumption was saved successfully.`);
      setReadings(await fetchMeterReadings());
      setSelectedConsumer(null);
      return true;
    } catch (requestError) {
      const message = requestError?.response?.data?.message ?? requestError.message ?? "Unable to save the reading.";
      setError(message);
      toast.error("Reading not recorded", message);
      return false;
    } finally { setSaving(false); }
  };

  return (
    <main className="space-y-6">
      <PageHeader description="Select the resident, enter the meter value, review the details, and confirm the record." eyebrow="Field workspace" title="Record a meter reading" />
      {error && <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadData} type="button">Try again</button></div>}
      {loading ? <LoadingSkeleton label="Loading assigned residents" variant="list" /> : <div className="w-full"><ConsumerSelectionList consumers={visibleConsumers} onSelect={(consumer) => { setSelectedConsumer(consumer); setError(""); }} query={query} selectedId={selectedConsumer?.id} setQuery={setQuery} /></div>}

      <Modal
        closeLabel="Close meter reading form"
        description={selectedConsumer ? `${selectedConsumer.consumerName} · ${selectedConsumer.purok}` : undefined}
        dismissible={!saving}
        eyebrow="Field operations"
        isOpen={Boolean(selectedConsumer)}
        onClose={() => setSelectedConsumer(null)}
        showCloseButton={false}
        size="md"
        title="Record meter reading"
      >
        {error && <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-6" role="alert">{error}</div>}
        <ConsumptionEntryPanel embedded consumer={selectedConsumer} key={`${selectedConsumer?.id}-${latestReading?.id ?? "new"}`} onCancel={() => setSelectedConsumer(null)} onSave={saveReading} previousReading={latestReading?.currentReading ?? 0} saving={saving} />
      </Modal>
    </main>
  );
}
