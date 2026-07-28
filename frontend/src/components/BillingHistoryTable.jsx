function getStatusClass(status) {
  if (status === "Paid") {
    return "bg-emerald-50 text-[#16A34A]";
  }

  if (status === "Partially Paid") {
    return "bg-amber-50 text-[#D97706]";
  }

  return "bg-red-50 text-[#DC2626]";
}

export default function BillingHistoryTable({ historyData = [], onSelectReceipt, onPayBalance, showConsumerDetails = true, receiptLabel = "View Receipt", allowAllReceipts = false }) {
  return (
    <div className="overflow-visible md:overflow-x-auto">
      <table
        className={`block w-full border-separate border-spacing-y-3 text-left text-sm md:table md:border-collapse md:border-spacing-0 ${showConsumerDetails ? "md:min-w-[980px]" : "md:min-w-[760px]"}`}
        data-testid="billing-history-table"
      >
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {showConsumerDetails && <th className="px-4 py-3">Consumer Name</th>}
            {showConsumerDetails && <th className="px-4 py-3">Purok</th>}
            <th className="px-4 py-3">Billing Period</th>
            <th className="px-4 py-3">Reading Date</th>
            <th className="px-4 py-3">Consumption</th>
            <th className="px-4 py-3">Amount Due</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-slate-100">
          {historyData.length === 0 && (
            <tr className="block rounded-2xl border border-dashed border-slate-200 bg-slate-50 md:table-row">
              <td
                className="block px-4 py-10 text-center text-sm font-medium text-slate-500 md:table-cell"
                colSpan={showConsumerDetails ? 8 : 6}
                data-testid="billing-history-empty-state"
              >
                There are no billing records yet.
              </td>
            </tr>
          )}
          {historyData.map((row) => {
            const canViewReceipt = allowAllReceipts || row.status === "Paid";
            const canPayBalance = row.outstandingBalance > 0 && (row.status === "Unpaid" || row.status === "Partially Paid");

            return (
              <tr
                className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-[#0F172A] shadow-[0_12px_36px_rgba(15,23,42,0.05)] transition hover:border-sky-200 md:table-row md:rounded-none md:border-0 md:p-0 md:shadow-none md:hover:bg-slate-50"
                data-testid="history-row"
                key={row.invoiceNumber}
              >
                {showConsumerDetails && <td className="col-span-2 flex flex-col border-b border-slate-100 pb-3 font-extrabold before:text-xs before:font-semibold before:text-slate-500 before:content-['Consumer_name'] md:table-cell md:border-0 md:px-4 md:py-4 md:text-sm md:before:hidden" data-testid="row-consumer-name">{row.consumerName ?? "Unknown consumer"}</td>}
                {showConsumerDetails && <td className="flex flex-col gap-1 text-slate-600 before:text-xs before:font-semibold before:text-slate-500 before:content-['Purok'] md:table-cell md:px-4 md:py-4 md:before:hidden" data-testid="row-purok">{row.purok ?? "Unassigned"}</td>}
                <td className="col-span-2 flex items-center justify-between border-b border-slate-100 pb-3 text-base font-extrabold before:text-xs before:font-semibold before:text-slate-500 before:content-['Billing_period'] md:table-cell md:border-0 md:px-4 md:py-4 md:text-sm md:before:hidden" data-testid="row-month">
                  {row.billingPeriod}
                </td>
                <td
                  className="flex flex-col gap-1 font-mono text-slate-600 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Reading_date'] md:table-cell md:px-4 md:py-4 md:before:hidden"
                  data-testid="row-reading-date"
                >
                  {row.readingDate}
                </td>
                <td className="flex flex-col gap-1 text-right font-mono before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Consumption'] md:table-cell md:px-4 md:py-4 md:text-left md:before:hidden" data-testid="row-consumption">
                  {row.cubicMetersConsumed} m³
                </td>
                <td className="flex flex-col gap-1 font-mono before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Amount_due'] md:table-cell md:px-4 md:py-4 md:before:hidden" data-testid="row-amount-due">
                  ₱{row.amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="flex items-end justify-end md:table-cell md:px-4 md:py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(row.status)}`}
                    data-status={row.status}
                    data-testid="row-status"
                  >
                    {row.status}
                  </span>
                </td>
                <td className="col-span-2 pt-1 text-right md:table-cell md:px-4 md:py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-3">
                    <button
                      className={[
                        "min-h-11 w-full rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 md:w-auto",
                        canViewReceipt
                          ? "border-sky-200 bg-sky-50 text-[#0284C7] hover:bg-sky-100"
                          : "cursor-not-allowed bg-slate-100 text-slate-400",
                      ].join(" ")}
                      data-testid={`view-receipt-${row.invoiceNumber}`}
                      disabled={!canViewReceipt}
                      onClick={() => canViewReceipt && onSelectReceipt && onSelectReceipt(row)}
                      type="button"
                    >
                      {canViewReceipt ? receiptLabel : "Unavailable"}
                    </button>
                    <button
                      className={[
                        "min-h-11 w-full rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 md:w-auto",
                        canPayBalance
                          ? "border-emerald-200 bg-emerald-50 text-[#16A34A] hover:bg-emerald-100"
                          : "cursor-not-allowed bg-slate-100 text-slate-400",
                      ].join(" ")}
                      data-testid={`pay-balance-${row.invoiceNumber}`}
                      disabled={!canPayBalance}
                      onClick={() => canPayBalance && onPayBalance && onPayBalance(row)}
                      type="button"
                    >
                      {canPayBalance ? `Pay ₱${row.outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "Paid"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
