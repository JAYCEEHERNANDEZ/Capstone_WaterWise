import express from "express";
import {
  addPayment,
  listBillingPayments,
  listConsumerPayments,
  listPayments,
  showPayment,
} from "../controllers/paymentControllers.js";
import {
  authenticate,
  authorizeOwnerOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin"), listPayments);
router.get(
  "/consumer/:consumerId",
  authorizeOwnerOrRoles("consumerId", "consumer", "admin"),
  listConsumerPayments
);
router.get("/billing/:billingId", authorizeRoles("admin"), listBillingPayments);
router.get("/:id", authorizeRoles("admin"), showPayment);
router.post("/", authorizeRoles("admin"), addPayment);

export default router;
