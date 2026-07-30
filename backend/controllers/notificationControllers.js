import {
  createNotification,
  getNotificationById,
  getNotifications,
  markNotificationAsRead,
} from "../models/notificationModels.js";

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

export async function addNotification(req, res) {
  try {
    const notification = await createNotification(req.body ?? {});
    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      data: notification,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create notification.");
  }
}

export async function listNotifications(req, res) {
  try {
    const notifications = await getNotifications({
      consumerId: req.query.consumerId,
    });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve notifications.");
  }
}

export async function showNotification(req, res) {
  try {
    const notification = await getNotificationById(req.params.id);
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve notification.");
  }
}

export async function markNotificationRead(req, res) {
  try {
    const readRecord = await markNotificationAsRead(
      req.params.id,
      req.user.id,
    );
    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: readRecord,
    });
  } catch (error) {
    return sendError(res, error, "Failed to mark notification as read.");
  }
}
