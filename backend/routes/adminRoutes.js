import express from "express";
import {
  editAdmin,
  listAdmins,
  registerAdmin,
  removeAdmin,
  showAdmin,
} from "../controllers/adminControllers.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));
router.get("/", listAdmins);
router.get("/:id", showAdmin);
router.post("/", registerAdmin);
router.patch("/:id", editAdmin);
router.delete("/:id", removeAdmin);

export default router;
