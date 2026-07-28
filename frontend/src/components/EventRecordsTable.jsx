const sampleEvents = [
  {
    id: 1,
    title: "Barangay Assembly",
    schedule: "July 10, 2026 - 9:00 AM",
    location: "Barangay Hall",
    status: "Upcoming",
    tags: "Community",
  },
  {
    id: 2,
    title: "Water System Maintenance",
    schedule: "July 15, 2026 - 1:00 PM",
    location: "Purok 3",
    status: "Scheduled",
    tags: "Maintenance",
  },
];

export default function EventRecordsTable({ events = sampleEvents, onEdit, onDelete }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">
        Event Records
      </h2>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="border p-3">Event Title</th>
            <th className="border p-3">Schedule</th>
            <th className="border p-3">Location</th>
            <th className="border p-3">Status</th>
            <th className="border p-3">Event Tags</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="text-center hover:bg-gray-50"
            >
              <td className="border p-3">{event.title}</td>

              <td className="border p-3">
                {event.schedule}
              </td>

              <td className="border p-3">
                {event.location}
              </td>

              <td className="border p-3">
                {event.status}
              </td>

              <td className="border p-3">
                {Array.isArray(event.tags) ? event.tags.join("") : event.tags}
              </td>

              <td className="border p-3 space-x-2">
                <button type="button" onClick={() => onEdit?.(event)} className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600">
                  Edit
                </button>

                <button type="button" onClick={() => onDelete?.(event.id)} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
