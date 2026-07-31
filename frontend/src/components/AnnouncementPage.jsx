import { CalendarDays, Megaphone } from "lucide-react";

const sampleAnnouncements = [
  {
    id: 1,
    title: "Water Interruption Notice",
    content: "Water service will be temporarily unavailable due to maintenance.",
    publicationDate: "July 5, 2026",
    relatedEvent: "Water System Maintenance",
  },
  {
    id: 2,
    title: "Barangay Assembly Reminder",
    content: "Residents are encouraged to attend the upcoming assembly.",
    publicationDate: "July 8, 2026",
    relatedEvent: "Barangay Assembly",
  },
];

function displayDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function AnnouncementPage({
  announcements = sampleAnnouncements,
  onEdit,
  onDelete,
  title = "Published announcements",
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-modal sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Communication history
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {announcements.length} shown
        </span>
      </div>

      {announcements.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Megaphone className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-bold text-slate-700">No announcements found</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Publish a new message or adjust the current search and category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              className="group rounded-2xl border border-slate-200 p-5 transition  hover:border-emerald-200 hover:shadow-raised"
              key={announcement.id}
            >
              <div className="flex items-start gap-4">
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:flex">
                  <Megaphone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-water-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-water-700">
                        {announcement.relatedEvent || "General Announcement"}
                      </span>
                      <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                        {announcement.title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {displayDate(announcement.publicationDate)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {announcement.content}
                  </p>
                  {(onEdit || onDelete) && (
                    <div className="mt-4 flex gap-2">
                      {onEdit && (
                        <button className="rounded-xl bg-water-50 px-3 py-2 text-sm font-bold text-water-700" onClick={() => onEdit(announcement)} type="button">
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700" onClick={() => onDelete(announcement.id)} type="button">
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
