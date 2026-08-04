import express from "express";
import {
  editAdmin,
  listAdmins,
  registerAdmin,
  removeAdmin,
  showAdmin,
} from "../controllers/adminControllers.js";
import { authorizeStaffAction } from "../controllers/authControllers.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("super-admin"));
router.get("/", listAdmins);
router.get("/:id", showAdmin);
router.post("/", authorizeStaffAction("create-admin"), registerAdmin);
router.patch("/:id", authorizeStaffAction("update-admin"), editAdmin);
router.delete("/:id", removeAdmin);

export default router;
