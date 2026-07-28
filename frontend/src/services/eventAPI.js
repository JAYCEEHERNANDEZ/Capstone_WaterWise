let events = [];

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function normalizeEvent(event) {
  const date = event.date ?? event.event_date ?? "";
  const time = event.time ?? event.event_time ?? "";

  return {
    ...event,
    id: event.id ?? event.event_id,
    title: event.title ?? event.event_title ?? "",
    description: event.description ?? "",
    date,
    time,
    schedule: event.schedule ?? [date, time].filter(Boolean).join(" - "),
    location: event.location ?? "",
    tags: normalizeTags(event.tags),
    status: event.status ?? "Scheduled",
  };
}

function eventPayload(event) {
  return {
    title: event.title?.trim(),
    description: event.description?.trim(),
    date: event.date,
    time: event.time,
    location: event.location?.trim(),
    tags: normalizeTags(event.tags),
    status: event.status ?? "Scheduled",
  };
}

export async function fetchEvents() {
  return events.map(normalizeEvent);
}

export async function fetchEventById(eventId) {
  return events.find((event) => event.id === eventId) ?? null;
}

export async function createEvent(event) {
  const saved = normalizeEvent({ ...eventPayload(event), id: crypto.randomUUID() });
  events = [saved, ...events];
  return saved;
}

export async function updateEvent(eventId, event) {
  const saved = normalizeEvent({ ...eventPayload(event), id: eventId });
  events = events.map((item) => item.id === eventId ? saved : item);
  return saved;
}

export async function deleteEvent(eventId) {
  events = events.filter((event) => event.id !== eventId);
}
