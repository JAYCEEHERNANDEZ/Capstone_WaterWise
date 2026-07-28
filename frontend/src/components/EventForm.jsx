import { useState } from "react";

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
  const [event, setEvent] = useState({
    ...initialValues(initialEvent),
  });

  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(event);
    } else {
      alert("Event Saved!");
      setEvent(initialValues());
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">
        {initialEvent ? "Edit Event" : "Create Event"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          name="title"
          placeholder="Event Title"
          value={event.title}
          onChange={handleChange}
          className="w-full rounded border p-3"
        />

        <textarea
          name="description"
          placeholder="Event Description"
          value={event.description}
          onChange={handleChange}
          className="w-full rounded border p-3"
          rows={4}
        />

        <input
          type="date"
          name="date"
          value={event.date}
          onChange={handleChange}
          className="w-full rounded border p-3"
        />

        <input
          type="time"
          name="time"
          value={event.time}
          onChange={handleChange}
          className="w-full rounded border p-3"
        />

        <input
          name="location"
          placeholder="Location"
          value={event.location}
          onChange={handleChange}
          className="w-full rounded border p-3"
        />

        <input
          name="tags"
          placeholder="Event Tags"
          value={event.tags}
          onChange={handleChange}
          className="w-full rounded border p-3"
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {initialEvent ? "Update Event" : "Save Event"}
        </button>
        {initialEvent && (
          <button type="button" onClick={onCancel} className="ml-3 rounded border px-6 py-3" disabled={submitting}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
