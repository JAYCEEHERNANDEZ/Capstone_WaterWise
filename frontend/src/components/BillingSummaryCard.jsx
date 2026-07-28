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
      title: "Total Bills",
      value: totalBills,
      testId: "total-bills-value",
    },
    {
      title: "Paid Bills",
      value: paidBills,
      testId: "paid-bills-value",
    },
    {
      title: "Partially Paid",
      value: partiallyPaidBills,
      testId: "partially-paid-value",
    },
    {
      title: "Unpaid Bills",
      value: unpaidBills,
      testId: "unpaid-bills-value",
    },
    {
      title: "Total Billing",
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-5"
          data-testid={card.testId.replace("-value", "-card")}
        >
          <h3 className="text-gray-500 text-sm font-medium">
            {card.title}
          </h3>

          <p
            className="text-3xl font-bold mt-2"
            data-testid={card.testId}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default BillingSummaryCard;