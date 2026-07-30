import express from "express";
import {
  generateMonthlyBilling,
  listBillings,
  listConsumerBillings,
  showBilling,
} from "../controllers/billingControllers.js";
import {
  authenticate,
  authorizeOwnerOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin"), listBillings);
router.get(
  "/consumer/:consumerId",
  authorizeOwnerOrRoles("consumerId", "consumer", "admin"),
  listConsumerBillings
);
router.get("/:id", authorizeRoles("admin"), showBilling);
router.post("/", authorizeRoles("admin"), generateMonthlyBilling);

export default router;
