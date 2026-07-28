import express from "express";
import {
  editConsumer,
  listConsumers,
  registerConsumer,
  removeConsumer,
  showConsumer,
} from "../controllers/consumerControllers.js";
import {
  authenticate,
  authorizeOwnerOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin", "meter-reader"), listConsumers);
router.get(
  "/:id",
  authorizeOwnerOrRoles("id", "consumer", "admin", "meter-reader"),
  showConsumer
);
router.post("/", authorizeRoles("admin"), registerConsumer);
router.patch("/:id", authorizeRoles("admin"), editConsumer);
router.delete("/:id", authorizeRoles("admin"), removeConsumer);

export default router;
