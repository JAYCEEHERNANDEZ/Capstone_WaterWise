import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../models/eventModels.js";

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

export async function listEvents(req, res) {
  try {
    return res.status(200).json({ success: true, data: await getEvents() });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve events.");
  }
}

export async function showEvent(req, res) {
  try {
    return res.status(200).json({ success: true, data: await getEventById(req.params.id) });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve event.");
  }
}

export async function addEvent(req, res) {
  try {
    const event = await createEvent(req.body ?? {}, req.user.id);
    return res.status(201).json({ success: true, message: "Event created successfully.", data: event });
  } catch (error) {
    return sendError(res, error, "Failed to create event.");
  }
}

export async function editEvent(req, res) {
  try {
    const event = await updateEvent(req.params.id, req.body ?? {});
    return res.status(200).json({ success: true, message: "Event updated successfully.", data: event });
  } catch (error) {
    return sendError(res, error, "Failed to update event.");
  }
}

export async function removeEvent(req, res) {
  try {
    await deleteEvent(req.params.id);
    return res.status(200).json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    return sendError(res, error, "Failed to delete event.");
  }
}
