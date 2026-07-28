const MeterReadingTable = ({
  readings,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  if (!readings.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">
          No meter reading records found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table
        role="table"
        className="min-w-full border-collapse"
      >
        <thead className="bg-blue-600 text-white">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left"
            >
              Consumer No.
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-left"
            >
              Consumer Name
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-left"
            >
              Purok
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-center"
            >
              Previous
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-center"
            >
              Current
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-center"
            >
              Consumption
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-center"
            >
              Reading Date
            </th>

            <th
              scope="col"
              className="px-4 py-3 text-center"
            >
              Status
            </th>

            {!readOnly && (
              <th scope="col" className="px-4 py-3 text-center">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {readings.map((reading) => (
            <tr
              key={reading.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                {reading.consumerNo}
              </td>

              <td className="px-4 py-3">
                {reading.consumerName}
              </td>

              <td className="px-4 py-3">
                {reading.purok}
              </td>

              <td className="px-4 py-3 text-center">
                {reading.previousReading}
              </td>

              <td className="px-4 py-3 text-center">
                {reading.currentReading}
              </td>

              <td className="px-4 py-3 text-center font-semibold">
                {reading.consumption}
              </td>

              <td className="px-4 py-3 text-center">
                {reading.readingDate}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    reading.status === "Recorded"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {reading.status}
                </span>
              </td>

              {!readOnly && (
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => onEdit?.(reading)} className="rounded bg-yellow-500 px-4 py-1 text-white hover:bg-yellow-600">Edit</button>
                    <button type="button" onClick={() => onDelete?.(reading.id)} className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700">Delete</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeterReadingTable;
