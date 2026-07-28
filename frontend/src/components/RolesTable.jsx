const RolesTable = ({
  roles = [],
  onEdit = () => {},
  onDelete = () => {},
}) => {
  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-500">No roles available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
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

        <tbody className="divide-y divide-gray-200">
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
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(role.id)}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
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