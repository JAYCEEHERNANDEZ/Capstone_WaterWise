function BillingSummaryCard({
  billingData = [],
}) {
  const totalBills = billingData.length;

  const paidBills = billingData.filter(
    (bill) => bill.status === "Paid"
  ).length;

  const partiallyPaidBills = billingData.filter(
    (bill) => bill.status === "Partially Paid"
  ).length;

  const unpaidBills = billingData.filter(
    (bill) => bill.status === "Unpaid"
  ).length;

  const totalBilling = billingData.reduce(
    (total, bill) => total + Number(bill.amountDue ?? 0),
    0
  );

  const summaryCards = [
    {
      title: "Total bills",
      value: totalBills,
      testId: "total-bills-value",
    },
    {
      title: "Paid bills",
      value: paidBills,
      testId: "paid-bills-value",
    },
    {
      title: "Partially Paid",
      value: partiallyPaidBills,
      testId: "partially-paid-value",
    },
    {
      title: "Unpaid bills",
      value: unpaidBills,
      testId: "unpaid-bills-value",
    },
    {
      title: "Total billed",
      value: `₱${totalBilling.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`,
      testId: "total-billing-value",
    },
  ];

  return (
    <section aria-label="Billing summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
          data-testid={card.testId.replace("-value", "-card")}
        >
          <h3 className="text-sm font-semibold text-slate-500">
            {card.title}
          </h3>

          <p
            className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-navy-900"
            data-testid={card.testId}
          >
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}

export default BillingSummaryCard;
