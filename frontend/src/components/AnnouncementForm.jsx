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
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <Megaphone className="h-5 w-5" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
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
              <option value="Barangay Assembly">Barangay Assembly</option>
              <option value="Water System Maintenance">Water Maintenance</option>
              <option value="Community Clean-up">Community Clean-up</option>
              <option value="General Announcement">General Announcement</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700"
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
