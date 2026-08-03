import express from "express";
import {
  addNotification,
  listNotifications,
  markNotificationRead,
  runNotificationReminders,
  showNotification,
} from "../controllers/notificationControllers.js";
import {
  authenticate,
  authorizeConsumerQueryOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeConsumerQueryOrRoles("admin"), listNotifications);
router.post(
  "/process-reminders",
  authorizeRoles("admin"),
  runNotificationReminders,
);
router.put("/:id/read", authorizeRoles("consumer"), markNotificationRead);
router.get("/:id", authorizeRoles("admin"), showNotification);
router.post("/", authorizeRoles("admin"), addNotification);

export default router;
