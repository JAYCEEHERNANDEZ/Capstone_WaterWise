export default function CurrentBalanceCard({ amountDue = 0 }) {
  const isOverdue = amountDue > 0;

  return (
    <section className="flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl bg-[#0F172A] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-6">
      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
          Current Balance
        </h3>
        <p className="text-sm text-slate-300">Outstanding account total</p>
      </div>
      <div className="mt-4">
        <span
          className={`font-mono text-3xl font-bold tracking-normal ${
            isOverdue
              ? "text-red-600 text-rose-300"
              : "text-gray-600 text-slate-200"
          }`}
          data-testid="balance-amount"
        >
          ₱
          {amountDue.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </span>
        <span className="mt-2 block text-xs font-semibold text-slate-400">
          Active amount due
        </span>
      </div>
    </section>
  );
}
