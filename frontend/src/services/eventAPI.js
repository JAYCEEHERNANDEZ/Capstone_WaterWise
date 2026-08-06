import { apiRequest } from "./apiClient";

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
  const response = await apiRequest("/events");
  return (response?.data ?? []).map(normalizeEvent);
}

export async function fetchEventById(eventId) {
  const response = await apiRequest(`/events/${eventId}`);
  return normalizeEvent(response.data);
}

export async function createEvent(event) {
  const response = await apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventPayload(event)),
  });
  return normalizeEvent(response.data);
}

export async function updateEvent(eventId, event) {
  const response = await apiRequest(`/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(eventPayload(event)),
  });
  return normalizeEvent(response.data);
}

export async function deleteEvent(eventId) {
  return apiRequest(`/events/${eventId}`, { method: "DELETE" });
}
