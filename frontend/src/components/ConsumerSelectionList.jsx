import { Search, UserRound } from "lucide-react";

export default function ConsumerSelectionList({ consumers = [], onSelect, query, selectedId, setQuery }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold">Select a consumer</h2>
        <label className="relative mt-4 block"><span className="sr-only">Search consumers</span><Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" onChange={(event) => setQuery(event.target.value)} placeholder="Search consumer name, number, or purok" type="search" value={query} /></label>
      </div>
      <div className="max-h-[46rem] space-y-3 overflow-y-auto p-4 sm:p-6">
        {consumers.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No consumers found.</p> : consumers.map((consumer) => (
          <button className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${selectedId === consumer.id ? "border-sky-500 bg-sky-50 ring-4 ring-sky-100" : "border-slate-200 hover:border-sky-300 hover:bg-slate-50"}`} key={consumer.id} onClick={() => onSelect(consumer)} type="button">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><UserRound className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block truncate font-extrabold text-slate-900">{consumer.consumerName}</span><span className="mt-0.5 block text-xs font-semibold text-slate-500">{consumer.consumerNo} · {consumer.purok}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
