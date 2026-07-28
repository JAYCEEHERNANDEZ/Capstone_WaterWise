import {
  createReading,
  getAllHistoryConsumption,
  getAllPuroksMonthlyHistory as getAllPuroksMonthlyHistoryService,
  getAllPuroksYearlyHistory as getAllPuroksYearlyHistoryService,
  getConsumptionRanking,
  getOverallMonthlyHistory,
  getOverallYearlyHistory,
  getPerPurokMonthlyHistory,
  getPerPurokYearlyHistory,
} from "../services/consumptionServices.js";
import {
  getAllConsumptionReadings,
  getConsumptionByConsumer,
} from "../models/consumptionModels.js";
import {
  createMonthlyBilling,
  getBillingsByConsumer,
} from "../models/billingModels.js";

const sameBillingMonth = (billingDate, readingDate) =>
  String(billingDate).slice(0, 7) === String(readingDate).slice(0, 7);

const createOrGetMonthlyBilling = async (consumerId, readingDate) => {
  try {
    return await createMonthlyBilling({
      consumerId,
      billingDate: readingDate,
    });
  } catch (error) {
    if (error.statusCode !== 409) throw error;

    const existingBillings = await getBillingsByConsumer(consumerId);
    const existingBilling = existingBillings.find((billing) =>
      sameBillingMonth(billing.billing_date, readingDate)
    );

    if (!existingBilling) throw error;
    return existingBilling;
  }
};

export const addConsumptionReading = async (req, res) => {
  try {
    const reading = await createReading(req.body ?? {});
    const billing = await createOrGetMonthlyBilling(
      reading.consumer_id,
      reading.reading_date
    );

    return res.status(201).json({
      success: true,
      message: "Meter reading created and monthly billing generated.",
      data: {
        ...reading,
        billing,
      },
    });
  } catch (error) {
    console.error("Create meter reading error:", error);

    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Failed to create meter reading.",
    });
  }
};

export const listConsumerConsumption = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: await getConsumptionByConsumer(req.params.consumerId),
    });
  } catch (error) {
    console.error("Consumer consumption retrieval error:", error);
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Failed to retrieve consumer consumption.",
    });
  }
};

export const listAllConsumptionReadings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: await getAllConsumptionReadings(),
    });
  } catch (error) {
    console.error("All consumption readings retrieval error:", error);
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Failed to retrieve consumption readings.",
    });
  }
};

const sendServiceResult = async (res, service, errorLabel, fallbackMessage) => {
  try {
    return res.status(200).json({ success: true, data: await service() });
  } catch (error) {
    console.error(`${errorLabel}:`, error);
    return res.status(500).json({
      success: false,
      message: error.message || fallbackMessage,
    });
  }
};

export const getConsumptionRankingData = async (req, res) =>
  sendServiceResult(
    res,
    getConsumptionRanking,
    "Consumption ranking error",
    "Failed to retrieve purok consumption ranking."
  );

export const getMonthlyHistory = async (req, res) =>
  sendServiceResult(
    res,
    getOverallMonthlyHistory,
    "Monthly history error",
    "Failed to retrieve monthly consumption history."
  );

export const getYearlyHistory = async (req, res) =>
  sendServiceResult(
    res,
    getOverallYearlyHistory,
    "Yearly history error",
    "Failed to retrieve yearly consumption history."
  );

export const getPurokMonthlyHistory = async (req, res) => {
  const { purok } = req.params;
  if (!purok) {
    return res.status(400).json({
      success: false,
      message: "Purok parameter is required.",
    });
  }

  return sendServiceResult(
    res,
    () => getPerPurokMonthlyHistory(purok),
    "Purok monthly history error",
    "Failed to retrieve purok monthly consumption history."
  );
};

export const getPurokYearlyHistory = async (req, res) => {
  const { purok } = req.params;
  if (!purok) {
    return res.status(400).json({
      success: false,
      message: "Purok parameter is required.",
    });
  }

  return sendServiceResult(
    res,
    () => getPerPurokYearlyHistory(purok),
    "Purok yearly history error",
    "Failed to retrieve purok yearly consumption history."
  );
};

export const getAllPuroksMonthlyHistory = async (req, res) =>
  sendServiceResult(
    res,
    getAllPuroksMonthlyHistoryService,
    "All puroks monthly history error",
    "Failed to retrieve all puroks monthly consumption history."
  );

export const getAllPuroksYearlyHistory = async (req, res) =>
  sendServiceResult(
    res,
    getAllPuroksYearlyHistoryService,
    "All puroks yearly history error",
    "Failed to retrieve all puroks yearly consumption history."
  );

export const generateAllHistoryConsumption = async (req, res) => {
  try {
    const history = await getAllHistoryConsumption();
    const yearlyHistory = Array.isArray(history?.overallYearly)
      ? history.overallYearly
      : [];
    const overallConsumption = yearlyHistory.reduce((total, item) => {
      const consumption = Number(item?.consumption ?? 0);
      return total + (Number.isFinite(consumption) ? consumption : 0);
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        overallConsumption: Number(overallConsumption.toFixed(2)),
        recordCount: yearlyHistory.length,
        yearlyHistory,
      },
    });
  } catch (error) {
    console.error("All history consumption error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve overall consumption history.",
    });
  }
};
