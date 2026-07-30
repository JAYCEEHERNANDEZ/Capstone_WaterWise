import express from "express";

import {
  getMeterReadings,
  getMeterReading,
  createMeterReading,
  updateMeterReading,
  deleteMeterReading,
} from "../controllers/meterReadingControllers.js";

const router = express.Router();

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
  getMeterReadings
);

router.get(
  "/meter-readings/:id",
  getMeterReading
);

router.post(
  "/meter-readings",
  createMeterReading
);

router.put(
  "/meter-readings/:id",
  updateMeterReading
);

router.delete(
  "/meter-readings/:id",
  deleteMeterReading
);

export default router;