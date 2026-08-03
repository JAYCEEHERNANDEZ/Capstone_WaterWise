import { AlertCircle, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import Table from "./Table";

function getStatusConfig(status) {
  if (status === "Paid") {
    return {
      Icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "Partially Paid") {
    return {
      Icon: Clock3,
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    Icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  };
}

export default function BillingHistoryTable({
  emptyDescription = "There are no billing records yet.",
  emptyTitle = "No billing records",
  highlightedBillingId,
  historyData = [],
  onViewReceipt,
  showConsumerDetails = true,
}) {
  return (
    <Table
      ariaLabel="Billing history"
      columns={[
        ...(showConsumerDetails
          ? [
              { key: "consumer", label: "Consumer Name" },
              { key: "purok", label: "Purok" },
            ]
          : []),
        { key: "invoice", label: "Invoice" },
        { key: "period", label: "Billing Period" },
        { key: "date", label: "Reading Date" },
        { key: "consumption", label: "Consumption" },
        { key: "amount", label: "Total Bill", className: "text-right" },
        { key: "balance", label: "Balance", className: "text-right" },
        { key: "status", label: "Status" },
        ...(onViewReceipt ? [{ key: "receipt", label: "Receipt", className: "text-right" }] : []),
      ]}
      data={historyData}
      emptyDescription={emptyDescription}
      emptyTestId="billing-history-empty-state"
      emptyTitle={emptyTitle}
      getRowKey={(row) => row.invoiceNumber}
      rowClassName={(row) => `grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-navy-900 transition-colors md:table-row md:p-0 ${
        Number(row.id) === Number(highlightedBillingId)
          ? "bg-water-50 ring-2 ring-inset ring-water-500"
          : "hover:bg-slate-50"
      }`}
      tableClassName={`block w-full text-left text-sm md:table ${
        showConsumerDetails ? "md:min-w-[1120px]" : onViewReceipt ? "md:min-w-[980px]" : "md:min-w-[860px]"
      }`}
      testId="billing-history-table"
      renderRow={(row) => {
        const { Icon: StatusIcon, className: statusClassName } = getStatusConfig(row.status);

        return (
          <>
            {showConsumerDetails && (
              <td
                className="col-span-2 flex flex-col border-b border-slate-100 pb-3 font-extrabold before:text-xs before:font-semibold before:text-slate-500 before:content-['Consumer_name'] md:table-cell md:border-0 md:px-4 md:py-4 md:text-sm md:before:hidden"
                data-testid="row-consumer-name"
              >
                {row.consumerName ?? "Unknown consumer"}
              </td>
            )}
            {showConsumerDetails && (
              <td
                className="flex flex-col gap-1 text-slate-600 before:text-xs before:font-semibold before:text-slate-500 before:content-['Purok'] md:table-cell md:px-4 md:py-4 md:before:hidden"
                data-testid="row-purok"
              >
                {row.purok ?? "Unassigned"}
              </td>
            )}
            <td className="flex flex-col gap-1 font-mono text-xs font-bold text-water-700 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Invoice'] md:table-cell md:px-4 md:py-4 md:before:hidden">
              {row.invoiceNumber}
            </td>
            <td
              className="col-span-2 flex items-center justify-between border-b border-slate-100 pb-3 text-base font-extrabold before:text-xs before:font-semibold before:text-slate-500 before:content-['Billing_period'] md:table-cell md:border-0 md:px-4 md:py-4 md:text-sm md:before:hidden"
              data-testid="row-month"
            >
              {row.billingPeriod}
            </td>
            <td
              className="flex flex-col gap-1 font-mono text-slate-600 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Reading_date'] md:table-cell md:px-4 md:py-4 md:before:hidden"
              data-testid="row-reading-date"
            >
              {row.readingDate}
            </td>
            <td
              className="flex flex-col gap-1 font-mono before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Consumption'] md:table-cell md:px-4 md:py-4 md:before:hidden"
              data-testid="row-consumption"
            >
              {row.cubicMetersConsumed} m³
            </td>
            <td
              className="flex flex-col gap-1 font-mono font-bold tabular-nums before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Total_bill'] md:table-cell md:px-4 md:py-4 md:text-right md:before:hidden"
              data-testid="row-amount-due"
            >
              ₱{Number(row.amountDue ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="flex flex-col gap-1 font-mono font-bold tabular-nums text-slate-700 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Balance'] md:table-cell md:px-4 md:py-4 md:text-right md:before:hidden">
              ₱{Number(row.outstandingBalance ?? row.amountDue ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="flex flex-col items-end gap-1 before:self-start before:text-xs before:font-semibold before:text-slate-500 before:content-['Status'] md:table-cell md:px-4 md:py-4 md:before:hidden">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClassName}`}
                data-status={row.status}
                data-testid="row-status"
              >
                <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                {row.status}
              </span>
            </td>
            {onViewReceipt && (
              <td className="col-span-2 flex items-center justify-end md:table-cell md:px-4 md:py-4 md:text-right">
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-water-700 hover:border-water-300 hover:bg-water-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 md:w-auto"
                  onClick={() => onViewReceipt(row)}
                  type="button"
                >
                  <ReceiptText aria-hidden="true" className="h-4 w-4" />
                  View receipt
                </button>
              </td>
            )}
          </>
        );
      }}
    />
  );
}
