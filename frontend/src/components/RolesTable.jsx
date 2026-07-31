const RolesTable = ({
  roles = [],
  onEdit = () => {},
  onDelete = () => {},
}) => {
  if (roles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-bold text-navy-900">No roles available</p>
        <p className="mt-1 text-sm text-slate-500">Configured staff roles will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Role Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Permissions
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Users Assigned
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Date Created
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-4 py-3">{role.name}</td>

              <td className="px-4 py-3">{role.description}</td>

              <td className="px-4 py-3">
                {role.permissions.join(", ")}
              </td>

              <td className="px-4 py-3">{role.usersAssigned}</td>

              <td className="px-4 py-3">{role.dateCreated}</td>

              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(role)}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-navy-900 hover:border-water-300 hover:bg-water-50"
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(role.id)}
                    className="min-h-11 rounded-xl border border-red-200 bg-white px-4 font-bold text-red-700 hover:bg-red-50"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesTable;
