import { CalendarDays, CheckCircle2, Clock3, Pencil, Trash2 } from "lucide-react";

const sampleEvents = [
  { id: 1, title: "Barangay Assembly", schedule: "10 July 2026, 9:00 AM", location: "Barangay Hall", status: "Upcoming", tags: "Community" },
  { id: 2, title: "Water System Maintenance", schedule: "15 July 2026, 1:00 PM", location: "Purok 3", status: "Scheduled", tags: "Maintenance" },
];

function EventStatus({ status }) {
  const scheduled = status === "Scheduled";
  const Icon = scheduled ? CheckCircle2 : Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${scheduled ? "border-water-200 bg-water-50 text-water-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export default function EventRecordsTable({ events = sampleEvents, onEdit, onDelete }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-50 text-water-700"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
        <div><h2 className="font-bold text-navy-900">Event records</h2><p className="text-sm text-slate-500">Scheduled barangay and water-system activities</p></div>
      </div>
      {events.length === 0 ? (
        <div className="px-5 py-12 text-center"><p className="font-bold text-navy-900">No events scheduled</p><p className="mt-1 text-sm text-slate-500">Create an event to add it to the community calendar.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="block w-full text-left text-sm md:table">
            <thead className="hidden bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 md:table-header-group"><tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tags</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="block divide-y divide-slate-100 md:table-row-group">
              {events.map((event) => (
                <tr className="grid grid-cols-2 gap-4 p-4 transition-colors hover:bg-slate-50 md:table-row md:p-0" key={event.id}>
                  <td className="col-span-2 flex flex-col font-bold text-navy-900 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Event'] md:table-cell md:px-4 md:py-4 md:before:hidden">{event.title}</td>
                  <td className="col-span-2 flex flex-col font-mono text-slate-600 before:mb-1 before:font-sans before:text-xs before:font-semibold before:text-slate-500 before:content-['Schedule'] md:table-cell md:px-4 md:py-4 md:before:hidden">{event.schedule}</td>
                  <td className="flex flex-col text-slate-600 before:mb-1 before:text-xs before:font-semibold before:text-slate-500 before:content-['Location'] md:table-cell md:px-4 md:py-4 md:before:hidden">{event.location}</td>
                  <td className="flex items-end md:table-cell md:px-4 md:py-4"><EventStatus status={event.status} /></td>
                  <td className="col-span-2 text-slate-600 md:table-cell md:px-4 md:py-4">{Array.isArray(event.tags) ? event.tags.join(", ") : event.tags}</td>
                  <td className="col-span-2 md:table-cell md:px-4 md:py-4"><div className="flex gap-2 md:justify-end"><button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 font-bold text-navy-900 hover:border-water-300 hover:bg-water-50 md:flex-none" onClick={() => onEdit?.(event)} type="button"><Pencil aria-hidden="true" className="h-4 w-4" />Edit</button><button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 font-bold text-red-700 hover:bg-red-50 md:flex-none" onClick={() => onDelete?.(event.id)} type="button"><Trash2 aria-hidden="true" className="h-4 w-4" />Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
