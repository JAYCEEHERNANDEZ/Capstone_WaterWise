export default function ConsumerInfoGrid({ name, purok, houseNumber }) {
  return (
    <section className="ww-glass rounded-2xl p-5 sm:p-6">
      <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-water-600">
        Account holder
      </h3>
      <div className="space-y-5">
        <div>
          <span className="block text-xs font-semibold text-slate-500">Full name</span>
          <span className="mt-1 block text-xl font-extrabold tracking-[-0.03em] text-navy-900" data-testid="info-name">
            {name || "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-water-100 pt-4">
          <div className="rounded-xl bg-white p-3">
            <span className="block text-xs font-semibold text-slate-500">Purok</span>
            <span className="mt-1 block text-base font-bold text-navy-900" data-testid="info-purok">
              {purok || "N/A"}
            </span>
          </div>
          <div className="rounded-xl bg-white p-3">
            <span className="block text-xs font-semibold text-slate-500">House no.</span>
            <span className="mt-1 block text-base font-bold text-navy-900" data-testid="info-house">
              {houseNumber || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
