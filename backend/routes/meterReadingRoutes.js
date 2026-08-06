import express from "express";

import {
  getMeterReadings,
  getMeterReading,
  createMeterReading,
  updateMeterReading,
  deleteMeterReading,
} from "../controllers/meterReadingControllers.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Meter Reading Routes
|--------------------------------------------------------------------------
|
| GET    /meter-readings
| GET    /meter-readings/:id
| POST   /meter-readings
| PUT    /meter-readings/:id
| DELETE /meter-readings/:id
|
*/

router.get(
  "/meter-readings",
  authorizeRoles("admin", "meter-reader"),
  getMeterReadings
);

router.get(
  "/meter-readings/:id",
  authorizeRoles("admin", "meter-reader"),
  getMeterReading
);

router.post(
  "/meter-readings",
  authorizeRoles("meter-reader"),
  createMeterReading
);

router.put(
  "/meter-readings/:id",
  authorizeRoles("meter-reader"),
  updateMeterReading
);

router.delete(
  "/meter-readings/:id",
  authorizeRoles("admin"),
  deleteMeterReading
);

export default router;
