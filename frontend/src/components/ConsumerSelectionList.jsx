import { UserRound } from "lucide-react";
import Search from "./Search";

export default function ConsumerSelectionList({ consumers = [], onSelect, query, selectedId, setQuery }) {
  return (
    <section className="ww-glass-strong overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <p className="ww-eyebrow !text-water-700">Step 1 of 4</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Select a resident</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Search by name, account number, or purok to confirm the correct meter.</p>
        <Search
          ariaLabel="Search residents"
          className="mt-4"
          onValueChange={setQuery}
          placeholder="Search name, account number, or purok"
          surface="white"
          value={query}
        />
      </div>
      <div className="max-h-[46rem] space-y-3 overflow-y-auto p-4 sm:p-6">
        {consumers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-bold text-slate-700">No residents found</p>
            <p className="mt-1 text-sm text-slate-500">Check the spelling or try a different account number or purok.</p>
          </div>
        ) : consumers.map((consumer) => (
          <button
            className={`flex min-h-24 w-full items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${selectedId === consumer.id ? "border-water-500 bg-water-50 ring-4 ring-water-100" : "border-slate-200 bg-white hover:border-water-300 hover:bg-water-50"}`}
            key={consumer.id}
            onClick={() => onSelect(consumer)}
            type="button"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-100 text-water-700">
              <UserRound aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-extrabold text-slate-900">{consumer.consumerName}</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-500">{consumer.consumerNo} · {consumer.purok}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
