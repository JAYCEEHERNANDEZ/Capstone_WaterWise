function ConsumerListTable({
  consumers = [],
  onEdit = () => {},
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#0284C7] text-white">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Account Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Purok</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consumers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-400">
                  No consumers found.
                </td>
              </tr>
            ) : (
              consumers.map((consumer) => (
                <tr key={consumer.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">{consumer.accountName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{consumer.fullName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{consumer.purok}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{consumer.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${consumer.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {consumer.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600" onClick={() => onEdit(consumer)} type="button">Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConsumerListTable;
