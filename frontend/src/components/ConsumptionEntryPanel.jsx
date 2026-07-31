import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ConsumptionEntryPanel({ consumer, onSave, previousReading = 0, saving = false }) {
  const [currentReading, setCurrentReading] = useState("");
  const [error, setError] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [anomalyAcknowledged, setAnomalyAcknowledged] = useState(false);
  const readingDate = new Date().toISOString().slice(0, 10);
  const consumption = currentReading === "" ? 0 : Number(currentReading) - Number(previousReading);
  const showsAnomaly = consumption > Math.max(Number(previousReading) * 0.5, 50);

  if (!consumer) return null;

  const review = (event) => {
    event.preventDefault();
    if (currentReading === "" || Number(currentReading) < Number(previousReading)) {
      setError("Enter a current reading that is equal to or greater than the previous reading.");
      return;
    }
    setError("");
    setIsReviewing(true);
  };

  const submit = async () => {
    if (showsAnomaly && !anomalyAcknowledged) {
      setError("Review the unusual change and confirm that the meter value is correct.");
      return;
    }

    setError("");
    const saved = await onSave({
      consumerId: consumer.id,
      consumerNo: consumer.consumerNo,
      consumerName: consumer.consumerName,
      purok: consumer.purok,
      previousReading: Number(previousReading),
      currentReading: Number(currentReading),
      readingDate,
      status: "Recorded",
    });
    if (saved !== false) setCurrentReading("");
  };

  return (
    <section className="ww-glass-strong rounded-2xl p-5 sm:p-6">
      <p className="ww-eyebrow !text-water-700">{isReviewing ? "Step 3 of 4" : "Step 2 of 4"}</p>
      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{isReviewing ? "Review the reading" : "Enter the meter reading"}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {isReviewing ? "Confirm the resident, meter values, date, and calculated consumption before recording." : "Use the exact number shown on the resident's meter."}
      </p>

      <div className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-water-300">Selected resident</p>
        <p className="mt-2 text-xl font-extrabold">{consumer.consumerName}</p>
        <p className="mt-1 text-sm text-water-100">{consumer.consumerNo} · {consumer.purok}</p>
      </div>

      {!isReviewing ? (
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={review}>
          <label className="text-sm font-bold text-slate-700">
            Previous reading
            <input className="ww-field mt-2 bg-slate-100 p-3 font-mono" readOnly type="number" value={previousReading} />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Current reading
            <input
              autoFocus
              className="ww-field mt-2 p-3 font-mono"
              inputMode="decimal"
              min={previousReading}
              onChange={(event) => setCurrentReading(event.target.value)}
              required
              type="number"
              value={currentReading}
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Reading date
            <input aria-readonly="true" className="ww-field mt-2 cursor-not-allowed bg-slate-100 p-3 text-slate-600" readOnly type="date" value={readingDate} />
          </label>
          <div className="rounded-xl border border-water-100 bg-water-50 p-4">
            <p className="text-xs font-bold text-water-700">Calculated consumption</p>
            <p className="ww-data-value mt-2 text-2xl font-extrabold text-water-800">{Math.max(consumption, 0).toLocaleString()} m³</p>
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2" role="alert">{error}</p>}
          <button className="ww-primary-button px-5 py-3 sm:col-span-2" type="submit">Review reading</button>
        </form>
      ) : (
        <div className="mt-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Previous reading", `${Number(previousReading).toLocaleString()} m³`],
              ["Current reading", `${Number(currentReading).toLocaleString()} m³`],
              ["Water consumed", `${Math.max(consumption, 0).toLocaleString()} m³`],
              ["Reading date", readingDate],
            ].map(([label, value]) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4" key={label}>
                <dt className="text-xs font-semibold text-slate-500">{label}</dt>
                <dd className="ww-data-value mt-1 font-mono text-lg font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {showsAnomaly && (
            <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <input className="mt-1 h-5 w-5 accent-water-600" checked={anomalyAcknowledged} onChange={(event) => setAnomalyAcknowledged(event.target.checked)} type="checkbox" />
              <span>
                <span className="flex items-center gap-2 text-sm font-bold text-amber-700"><AlertTriangle aria-hidden="true" className="h-4 w-4" /> Unusual increase</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">This reading is much higher than the previous value. I checked the meter and confirm it is correct.</span>
              </span>
            </label>
          )}

          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50" disabled={saving} onClick={() => { setIsReviewing(false); setError(""); }} type="button">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Edit reading
            </button>
            <button className="ww-primary-button flex items-center justify-center gap-2 px-5 py-3" disabled={saving} onClick={submit} type="button">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {saving ? "Recording..." : "Confirm and record"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
