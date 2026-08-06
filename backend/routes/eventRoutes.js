import express from "express";
import {
  addEvent,
  editEvent,
  listEvents,
  removeEvent,
  showEvent,
} from "../controllers/eventControllers.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));
router.get("/", listEvents);
router.get("/:id", showEvent);
router.post("/", addEvent);
router.put("/:id", editEvent);
router.delete("/:id", removeEvent);

export default router;
