import { useState } from "react";
import { CalendarDays, FileText, Megaphone, Send } from "lucide-react";

const emptyAnnouncement = {
  title: "",
  content: "",
  publicationDate: "",
  relatedEvent: "",
};

export default function AnnouncementForm({
  onSubmit,
  initialData = null,
  onCancel,
}) {
  const [announcement, setAnnouncement] = useState(
    () => initialData ?? emptyAnnouncement,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setAnnouncement((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onSubmit) return;

    try {
      setSubmitting(true);
      const saved = await onSubmit(announcement);
      if (saved !== false && !initialData) setAnnouncement(emptyAnnouncement);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-slate-400 focus:border-water-600 focus:ring-4 focus:ring-water-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="bg-navy-950 p-6 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-water-900 text-water-300">
          <Megaphone className="h-5 w-5" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-water-300">
          Publishing desk
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          {initialData ? "Update announcement" : "Create announcement"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Published messages are delivered to every consumer portal.
        </p>
      </header>

      <form className="space-y-5 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-slate-700" htmlFor="announcement-title">
            Announcement title
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} pl-11`}
              id="announcement-title"
              maxLength={255}
              name="title"
              onChange={handleChange}
              placeholder="Enter a clear announcement title"
              required
              type="text"
              value={announcement.title}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-bold text-slate-700" htmlFor="announcement-content">
              Message
            </label>
            <span className="text-xs font-medium text-slate-400">
              {announcement.content.length} characters
            </span>
          </div>
          <textarea
            className={`${inputClass} min-h-36 resize-y leading-6`}
            id="announcement-content"
            name="content"
            onChange={handleChange}
            placeholder="Write the information consumers need to know..."
            required
            rows={6}
            value={announcement.content}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="announcement-date">
              Publication date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-11`}
                id="announcement-date"
                name="publicationDate"
                onChange={handleChange}
                required
                type="date"
                value={announcement.publicationDate}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="announcement-type">
              Category
            </label>
            <select
              className={inputClass}
              id="announcement-type"
              name="relatedEvent"
              onChange={handleChange}
              required
              value={announcement.relatedEvent}
            >
              <option value="">Select category</option>
              <option value="General Announcement">General Announcement</option>
              <option value="Water Interruption">Water Interruption</option>
              <option value="System Maintenance">System Maintenance</option>
              <option value="Service Restoration">Service Restoration</option>
              <option value="Billing Notice">Billing Notice</option>
              <option value="Meter Reading Advisory">Meter Reading Advisory</option>
              <option value="Emergency Notice">Emergency Notice</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white transition-colors hover:bg-water-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            <Send className="h-4 w-4" />
            {submitting
              ? "Publishing..."
              : initialData
                ? "Update announcement"
                : "Publish announcement"}
          </button>
          {initialData && (
            <button
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-bold text-navy-900 hover:bg-slate-50"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
