import { useState } from "react";
import { CalendarDays, Save } from "lucide-react";

function toTimeInputValue(value = "") {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value);
  if (!match) return value;
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function initialValues(initialEvent) {
  return {
    title: initialEvent?.title ?? "",
    description: initialEvent?.description ?? "",
    date: initialEvent?.date ?? "",
    time: toTimeInputValue(initialEvent?.time),
    location: initialEvent?.location ?? "",
    tags: Array.isArray(initialEvent?.tags) ? initialEvent.tags.join(", ") : initialEvent?.tags ?? "",
  };
}

export default function EventForm({ initialEvent, onCancel, onSubmit, submitting = false }) {
  const [event, setEvent] = useState(() => initialValues(initialEvent));
  const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-navy-900 outline-none transition-colors placeholder:text-slate-400 focus:border-water-600 focus:ring-4 focus:ring-water-100";
  const labelClass = "text-sm font-bold text-navy-900";

  const handleChange = ({ target }) => {
    setEvent((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (onSubmit) await onSubmit(event);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-100 text-water-700"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
        <h2 className="mt-4 text-xl font-bold text-navy-900">{initialEvent ? "Edit event" : "Create event"}</h2>
        <p className="mt-1 text-sm text-slate-600">Add the schedule and details residents need to plan ahead.</p>
      </header>

      <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit}>
        <div className="sm:col-span-2"><label className={labelClass} htmlFor="event-title">Event title</label><input className={fieldClass} id="event-title" name="title" onChange={handleChange} placeholder="e.g. Water system maintenance" required value={event.title} /></div>
        <div className="sm:col-span-2"><label className={labelClass} htmlFor="event-description">Description</label><textarea className={`${fieldClass} min-h-32 py-3`} id="event-description" name="description" onChange={handleChange} placeholder="Describe what residents need to know" required rows={4} value={event.description} /></div>
        <div><label className={labelClass} htmlFor="event-date">Date</label><input className={fieldClass} id="event-date" name="date" onChange={handleChange} required type="date" value={event.date} /></div>
        <div><label className={labelClass} htmlFor="event-time">Time</label><input className={fieldClass} id="event-time" name="time" onChange={handleChange} required type="time" value={event.time} /></div>
        <div><label className={labelClass} htmlFor="event-location">Location</label><input className={fieldClass} id="event-location" name="location" onChange={handleChange} placeholder="Barangay Hall or Purok" required value={event.location} /></div>
        <div><label className={labelClass} htmlFor="event-tags">Category tags</label><input className={fieldClass} id="event-tags" name="tags" onChange={handleChange} placeholder="Maintenance, community" value={event.tags} /></div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
          {initialEvent && <button className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 font-bold text-navy-900 hover:bg-slate-50" disabled={submitting} onClick={onCancel} type="button">Cancel</button>}
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-water-600 px-5 font-bold text-white hover:bg-water-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit"><Save aria-hidden="true" className="h-4 w-4" />{submitting ? "Saving event…" : initialEvent ? "Update event" : "Create event"}</button>
        </div>
      </form>
    </section>
  );
}
