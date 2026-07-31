export default function CurrentBalanceCard({ amountDue = 0 }) {
  const hasBalance = amountDue > 0;

  return (
    <section className="ww-page-header flex min-h-44 flex-col justify-between p-5 text-white sm:p-6">
      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-water-300">
          Amount due
        </h3>
        <p className="text-sm text-water-100">
          {hasBalance ? "Payment is needed" : "Your account is up to date"}
        </p>
      </div>
      <div className="mt-4">
        <span
          className={`ww-data-value font-mono text-3xl font-bold tracking-normal ${hasBalance ? "text-white" : "text-water-200"}`}
          data-testid="balance-amount"
        >
          ₱
          {amountDue.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </span>
        <span className="mt-2 block text-xs font-semibold text-water-100">
          {hasBalance ? "Outstanding household balance" : "No unpaid bills"}
        </span>
      </div>
    </section>
  );
}
