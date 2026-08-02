import { apiRequest } from "./apiClient";

function currentLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function normalizeAnnouncement(notification) {
  return {
    id: notification.id,
    title: notification.title,
    content: notification.message,
    publicationDate: notification.announcement_date,
    relatedEvent: notification.announcement_type,
    consumerId: notification.consumer_id,
    createdAt: notification.created_at,
  };
}

export async function fetchAnnouncements(options = {}) {
  const response = await apiRequest("/notifications", options);
  const notifications = response?.data ?? [];
  return Array.isArray(notifications)
    ? notifications
        .filter((notification) => notification.consumer_id == null)
        .map(normalizeAnnouncement)
    : [];
}

export async function createAnnouncement(payload) {
  const response = await apiRequest("/notifications", {
    method: "POST",
    body: JSON.stringify({
      consumerId: payload.consumerId ?? null,
      announcementType: payload.relatedEvent || "General Announcement",
      title: payload.title,
      announcementDate: currentLocalDate(),
      message: payload.content,
    }),
  });
  return normalizeAnnouncement(response.data);
}
