import express from "express";
import {
  editMeterReader,
  listMeterReaders,
  registerMeterReader,
  removeMeterReader,
  showMeterReader,
} from "../controllers/meterReaderControllers.js";
import {
  authenticate,
  authorizeOwnerOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin"), listMeterReaders);
router.get(
  "/:id",
  authorizeOwnerOrRoles("id", "meter-reader", "admin"),
  showMeterReader
);
router.post("/", authorizeRoles("admin"), registerMeterReader);
router.patch("/:id", authorizeRoles("admin"), editMeterReader);
router.delete("/:id", authorizeRoles("admin"), removeMeterReader);

export default router;
