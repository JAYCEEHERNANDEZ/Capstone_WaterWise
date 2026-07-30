import express from "express";
import {
  addConsumptionReading,
  generateAllHistoryConsumption,
  getAllPuroksMonthlyHistory,
  getAllPuroksYearlyHistory,
  getConsumptionRankingData,
  getMonthlyHistory,
  getPurokMonthlyHistory,
  getPurokYearlyHistory,
  getYearlyHistory,
  listAllConsumptionReadings,
  listConsumerConsumption,
} from "../controllers/consumptionControllers.js";
import {
  authenticate,
  authorizeOwnerOrRoles,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get(
  "/admin/readings",
  authorizeRoles("admin"),
  listAllConsumptionReadings,
);
router.get(
  "/readings",
  authorizeRoles("meter-reader"),
  listAllConsumptionReadings,
);
router.post(
  "/readings",
  authorizeRoles("meter-reader"),
  addConsumptionReading
);
router.get(
  "/consumer/:consumerId",
  authorizeOwnerOrRoles("consumerId", "consumer", "admin", "meter-reader"),
  listConsumerConsumption
);
router.get("/ranking", authorizeRoles("admin"), getConsumptionRankingData);
router.use("/history", authorizeRoles("admin"));
router.get("/history/overall", generateAllHistoryConsumption);
router.get("/history/monthly", getMonthlyHistory);
router.get("/history/yearly", getYearlyHistory);
router.get("/history/monthly/all-puroks", getAllPuroksMonthlyHistory);
router.get("/history/yearly/all-puroks", getAllPuroksYearlyHistory);
router.get("/history/monthly/purok/:purok", getPurokMonthlyHistory);
router.get("/history/yearly/purok/:purok", getPurokYearlyHistory);

export default router;
