import { AlertCircle, CheckCircle2, CircleHelp, Pencil } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";
import Table from "./Table";

function AccountStatus({ status }) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  const statusConfig = {
    active: {
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      Icon: CheckCircle2,
      label: "Active",
    },
    inactive: {
      className: "border-red-200 bg-red-50 text-red-700",
      Icon: AlertCircle,
      label: "Inactive",
    },
  };
  const config = statusConfig[normalizedStatus] ?? {
    className: "border-slate-200 bg-slate-50 text-slate-700",
    Icon: CircleHelp,
    label: status || "Unknown",
  };
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.className}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function ConsumerListTable({ consumers = [], isLoading = false, onEdit = () => {} }) {
  if (isLoading) {
    return (
      <LoadingSkeleton
        count={5}
        label="Loading resident accounts"
        variant="table"
      />
    );
  }

  return (
    <Table
      ariaLabel="Resident accounts"
      columns={[
        { key: "username", label: "Username" },
        { key: "name", label: "Name" },
        { key: "purok", label: "Purok" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
        { key: "action", label: "Action", className: "text-right" },
      ]}
      data={consumers}
      emptyDescription="Adjust the search or purok filter, or add a resident to the directory."
      emptyTitle="No residents found"
      getRowKey={(consumer) => consumer.id}
      renderRow={(consumer) => (
        <>
                  <td className="col-span-2 flex flex-col font-mono font-bold text-navy-900 before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Username'] md:table-cell md:px-4 md:py-4 md:before:hidden">
                    {consumer.accountName}
                  </td>
                  <td className="col-span-2 flex flex-col font-semibold text-navy-900 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Name'] md:table-cell md:px-4 md:py-4 md:before:hidden">
                    {consumer.fullName}
                  </td>
                  <td className="flex flex-col text-slate-600 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Purok'] md:table-cell md:px-4 md:py-4 md:before:hidden">
                    {consumer.purok || "Unassigned"}
                  </td>
                  <td className="col-span-2 flex min-w-0 flex-col break-all text-slate-600 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Email'] md:table-cell md:px-4 md:py-4 md:before:hidden">
                    {consumer.email || "No email provided"}
                  </td>
                  <td className="flex items-end md:table-cell md:px-4 md:py-4">
                    <AccountStatus status={consumer.status} />
                  </td>
                  <td className="col-span-2 md:table-cell md:px-4 md:py-4 md:text-right">
                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-navy-900 transition-colors hover:border-water-300 hover:bg-water-50 hover:text-water-700 md:w-auto"
                      onClick={() => onEdit(consumer)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Edit resident
                    </button>
                  </td>
        </>
      )}
    />
  );
}

export default ConsumerListTable;
