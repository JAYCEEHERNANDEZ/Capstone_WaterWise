import Table from "./Table";

const RolesTable = ({
  roles = [],
  onEdit = () => {},
  onDelete = () => {},
}) => {
  return (
    <Table
      ariaLabel="Configured roles"
      columns={[{ key: "name", label: "Role Name" }, { key: "description", label: "Description" }, { key: "permissions", label: "Permissions" }, { key: "users", label: "Users Assigned" }, { key: "created", label: "Date Created" }, { key: "actions", label: "Actions", className: "text-center" }]}
      data={roles}
      emptyDescription="Configured staff roles will appear here."
      emptyTitle="No roles available"
      getRowKey={(role) => role.id}
      renderRow={(role) => <>
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
      </>}
      tableClassName="w-full min-w-[760px] text-left text-sm"
      rowClassName="transition-colors hover:bg-slate-50"
    />
  );
};

export default RolesTable;
