import { AlertCircle, CheckCircle2, Clock3, Eye, WalletCards } from "lucide-react";

function getStatusConfig(status) {
  if (status === "Paid") {
    return { Icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }

  if (status === "Partially Paid") {
    return { Icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800" };
  }

  return { Icon: AlertCircle, className: "border-red-200 bg-red-50 text-red-700" };
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
            const { Icon: StatusIcon, className: statusClassName } = getStatusConfig(row.status);

            return (
              <tr
                className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-navy-900 shadow-card transition hover:border-water-200 md:table-row md:rounded-none md:border-0 md:p-0 md:shadow-none md:hover:bg-slate-50"
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClassName}`}
                    data-status={row.status}
                    data-testid="row-status"
                  >
                    <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    {row.status}
                  </span>
                </td>
                <td className="col-span-2 pt-1 text-right md:table-cell md:px-4 md:py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-3">
                    <button
                      className={[
                        "min-h-11 w-full rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 md:w-auto",
                        canViewReceipt
                          ? "border-water-200 bg-water-50 text-water-600 hover:bg-water-100"
                          : "cursor-not-allowed bg-slate-100 text-slate-400",
                      ].join(" ")}
                      data-testid={`view-receipt-${row.invoiceNumber}`}
                      disabled={!canViewReceipt}
                      onClick={() => canViewReceipt && onSelectReceipt && onSelectReceipt(row)}
                      type="button"
                    >
                      {canViewReceipt && <Eye aria-hidden="true" className="mr-2 inline h-4 w-4" />}
                      {canViewReceipt ? receiptLabel : "Unavailable"}
                    </button>
                    <button
                      className={[
                        "min-h-11 w-full rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:w-auto",
                        canPayBalance
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "cursor-not-allowed bg-slate-100 text-slate-400",
                      ].join(" ")}
                      data-testid={`pay-balance-${row.invoiceNumber}`}
                      disabled={!canPayBalance}
                      onClick={() => canPayBalance && onPayBalance && onPayBalance(row)}
                      type="button"
                    >
                      {canPayBalance ? <WalletCards aria-hidden="true" className="mr-2 inline h-4 w-4" /> : <CheckCircle2 aria-hidden="true" className="mr-2 inline h-4 w-4" />}
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
