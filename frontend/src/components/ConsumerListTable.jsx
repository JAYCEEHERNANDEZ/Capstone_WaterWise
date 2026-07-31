import { AlertCircle, CheckCircle2, CircleHelp, Pencil } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";

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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {consumers.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="font-bold text-navy-900">No residents found</p>
          <p className="mt-1 text-sm text-slate-500">
            Adjust the search or purok filter, or add a resident to the directory.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Rows become labeled record cards on mobile while preserving table semantics on desktop. */}
          <table className="block w-full text-left text-sm md:table">
            <thead className="hidden bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 md:table-header-group">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Purok</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-slate-100 md:table-row-group">
              {consumers.map((consumer) => (
                <tr
                  className="grid grid-cols-2 gap-4 p-4 transition-colors hover:bg-slate-50 md:table-row md:p-0"
                  key={consumer.id}
                >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ConsumerListTable;
