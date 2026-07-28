export default function ConsumerInfoGrid({ name, purok, houseNumber }) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/60 p-5 shadow-[0_16px_48px_rgba(14,165,233,0.08)] sm:p-6">
      <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#0284C7]">
        Account holder
      </h3>
      <div className="space-y-5">
        <div>
          <span className="block text-xs font-semibold text-slate-500">Full name</span>
          <span className="mt-1 block text-xl font-extrabold tracking-[-0.03em] text-[#0F172A]" data-testid="info-name">
            {name || "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-sky-100 pt-4">
          <div className="rounded-xl bg-white/80 p-3">
            <span className="block text-xs font-semibold text-slate-500">Purok</span>
            <span className="mt-1 block text-base font-bold text-[#0F172A]" data-testid="info-purok">
              {purok || "N/A"}
            </span>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <span className="block text-xs font-semibold text-slate-500">House no.</span>
            <span className="mt-1 block text-base font-bold text-[#0F172A]" data-testid="info-house">
              {houseNumber || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
