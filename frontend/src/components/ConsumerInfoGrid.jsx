export default function ConsumerInfoGrid({ name, purok }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
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
        {purok && (
          <div className="border-t border-slate-200 pt-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-xs font-semibold text-slate-500">Purok</span>
              <span className="mt-1 block text-base font-bold text-navy-900" data-testid="info-purok">
                {purok}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
