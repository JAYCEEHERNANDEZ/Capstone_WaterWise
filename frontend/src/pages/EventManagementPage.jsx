import { useCallback, useEffect, useState } from "react";
import EventForm from "../components/EventForm";
import EventRecordsTable from "../components/EventRecordsTable";
import {
  createEvent as createEventRequest,
  deleteEvent as deleteEventRequest,
  fetchEvents,
  updateEvent as updateEventRequest,
} from "../services/eventAPI";

export default function EventManagementPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setEvents(await fetchEvents());
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => fetchEvents()
      .then((records) => {
        if (active) setEvents(records);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to load events.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    refresh();
    const intervalId = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const saveEvent = async (event) => {
    try {
      setSaving(true);
      setError("");
      if (selectedEvent) {
        await updateEventRequest(selectedEvent.id, { ...selectedEvent, ...event });
      } else {
        await createEventRequest({ ...event, status: "Scheduled" });
      }
      setSelectedEvent(null);
      await loadEvents();
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to save the event.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setError("");
      await deleteEventRequest(eventId);
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
      await loadEvents();
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? requestError.message ?? "Unable to delete the event.");
    }
  };

  return (
    <main className="space-y-6">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
          Community schedule
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Event Management</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Create, review, and manage tagged community events.
        </p>
      </header>

      {error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-bold underline" onClick={loadEvents} type="button">Try again</button></div>}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.6fr)]">
        <EventForm initialEvent={selectedEvent} key={selectedEvent?.id ?? "new-event"} onCancel={() => setSelectedEvent(null)} onSubmit={saveEvent} submitting={saving} />
        <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Event preview</p><h3 className="mt-1 text-xl font-extrabold">Selected Event</h3>
          {selectedEvent ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Title</dt><dd>{selectedEvent.title}</dd></div>
              <div><dt className="font-semibold text-slate-500">Schedule</dt><dd>{selectedEvent.schedule}</dd></div>
              <div><dt className="font-semibold text-slate-500">Location</dt><dd>{selectedEvent.location}</dd></div>
              <div><dt className="font-semibold text-slate-500">Tags</dt><dd>{Array.isArray(selectedEvent.tags) ? selectedEvent.tags.join(", ") : selectedEvent.tags}</dd></div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Select Edit on an event to inspect its details.
            </p>
          )}
        </aside>
      </section>

      {loading ? <div className="grid gap-3">{[1, 2, 3].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div> : <EventRecordsTable events={events} onDelete={deleteEvent} onEdit={setSelectedEvent} />}
    </main>
  );
}
