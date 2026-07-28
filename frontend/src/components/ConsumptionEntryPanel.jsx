import { useState } from "react";

export default function ConsumptionEntryPanel({ consumer, onSave, previousReading = 0, saving = false }) {
  const [currentReading, setCurrentReading] = useState("");
  const readingDate = new Date().toISOString().slice(0, 10);
  const [error, setError] = useState("");
  const consumption = currentReading === "" ? 0 : Number(currentReading) - Number(previousReading);

  const submit = async (event) => {
    event.preventDefault();
    if (currentReading === "" || Number(currentReading) < Number(previousReading)) {
      setError("Current reading must be greater than or equal to the previous reading.");
      return;
    }
    setError("");
    const saved = await onSave({ consumerId: consumer.id, consumerNo: consumer.consumerNo, consumerName: consumer.consumerName, purok: consumer.purok, previousReading: Number(previousReading), currentReading: Number(currentReading), readingDate, status: "Recorded" });
    if (saved !== false) setCurrentReading("");
  };

  if (!consumer) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Step 2</p><h2 className="mt-1 text-2xl font-extrabold">Record consumption</h2>
      <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected consumer</p><p className="mt-2 text-xl font-extrabold">{consumer.consumerName}</p><p className="mt-1 text-sm text-slate-300">{consumer.consumerNo} · {consumer.purok}</p></div>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-bold text-slate-700">Previous reading<input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 p-3" readOnly type="number" value={previousReading} /></label>
        <label className="text-sm font-bold text-slate-700">Current reading<input className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" onChange={(event) => setCurrentReading(event.target.value)} type="number" value={currentReading} /></label>
        <label className="text-sm font-bold text-slate-700">Reading date<input aria-readonly="true" className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-600" readOnly type="date" value={readingDate} /></label>
        <div className="rounded-xl bg-sky-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sky-600">Calculated consumption</p><p className="mt-2 text-2xl font-extrabold text-sky-800">{Math.max(consumption, 0).toLocaleString()} m³</p></div>
        {error && <p className="text-sm font-semibold text-red-600 sm:col-span-2" role="alert">{error}</p>}
        <button className="rounded-xl bg-sky-600 px-5 py-3 font-bold text-white hover:bg-sky-700 disabled:opacity-60 sm:col-span-2" disabled={saving} type="submit">{saving ? "Saving reading..." : "Save consumption record"}</button>
      </form>
    </section>
  );
}
