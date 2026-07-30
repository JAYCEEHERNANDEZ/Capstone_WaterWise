import express from "express";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import consumptionRoutes from "./routes/consumptionRoutes.js";
import consumerRoutes from "./routes/consumerRoutes.js";
import geminiRoutes from "./routes/predictionRoutes.js";
import meterReaderRoutes from "./routes/meterReaderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import anomaly from "./routes/anomalyRoutes.js";
import recomendationRoutes from "./routes/recommendationRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/admins", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/consumption/prediction", geminiRoutes);
app.use("/api/consumers", consumerRoutes);
app.use("/api/meter-readers", meterReaderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/anomaly", anomaly);
app.use("/api/recommendation", recomendationRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON.",
    });
  }

  return next(error);
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`WaterWise Backend running on http://localhost:${PORT}`);
});

export default app;
