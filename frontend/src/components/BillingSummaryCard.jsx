function BillingSummaryCard({ billingData = [] }) {
  const totalBills = billingData.length;
  const paidBills = billingData.filter((bill) => bill.status === "Paid").length;
  const partiallyPaidBills = billingData.filter(
    (bill) => bill.status === "Partially Paid",
  ).length;
  const unpaidBills = billingData.filter((bill) => bill.status === "Unpaid").length;
  const totalBilling = billingData.reduce(
    (total, bill) => total + Number(bill.amountDue ?? 0),
    0,
  );
  const outstanding = billingData.reduce(
    (total, bill) => total + Number(bill.outstandingBalance ?? 0),
    0,
  );

  const currency = (value) =>
    `₱${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const summaryCards = [
    {
      title: "Total billed",
      value: currency(totalBilling),
      detail: `${totalBills} billing ${totalBills === 1 ? "record" : "records"}`,
      testId: "total-billing-value",
    },
    {
      title: "Outstanding balance",
      value: currency(outstanding),
      detail: "Remaining amount to collect",
      testId: "outstanding-billing-value",
    },
    {
      title: "Paid bills",
      value: paidBills,
      detail: "Fully settled accounts",
      testId: "paid-bills-value",
    },
    {
      title: "Open bills",
      value: partiallyPaidBills + unpaidBills,
      detail: `${unpaidBills} unpaid · ${partiallyPaidBills} partially paid`,
      testId: "open-bills-value",
    },
  ];

  return (
    <section aria-label="Billing summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5"
          data-testid={card.testId.replace("-value", "-card")}
        >
          <h2 className="text-sm font-semibold text-slate-500">{card.title}</h2>
          <p
            className="mt-2 font-mono text-2xl font-extrabold tabular-nums text-navy-900 sm:text-3xl"
            data-testid={card.testId}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}

export default BillingSummaryCard;
