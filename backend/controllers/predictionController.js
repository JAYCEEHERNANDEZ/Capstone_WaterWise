import {
  generateAllPredictionsService,
  generateAllPuroksMonthlyPrediction,
  generateAllPuroksYearlyPrediction,
  generateOverallMonthlyPrediction,
  generateOverallYearlyPrediction,
  generatePerPurokMonthlyPrediction,
  generatePerPurokYearlyPrediction,
} from "../services/predictionServices.js";

const sendPrediction = async (res, service, errorLabel, fallbackMessage) => {
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

const requirePurok = (req, res) => {
  const { purok } = req.params;
  if (!purok) {
    res.status(400).json({
      success: false,
      message: "Purok parameter is required.",
    });
    return null;
  }
  return purok;
};

export const getOverallMonthlyPrediction = async (req, res) =>
  sendPrediction(
    res,
    generateOverallMonthlyPrediction,
    "Overall monthly AI prediction error",
    "Failed to generate overall monthly consumption prediction."
  );

export const getOverallYearlyPrediction = async (req, res) =>
  sendPrediction(
    res,
    generateOverallYearlyPrediction,
    "Overall yearly AI prediction error",
    "Failed to generate overall yearly consumption prediction."
  );

export const getPerPurokMonthlyPrediction = async (req, res) => {
  const purok = requirePurok(req, res);
  if (!purok) return;

  return sendPrediction(
    res,
    () => generatePerPurokMonthlyPrediction(purok),
    "Per purok monthly AI prediction error",
    "Failed to generate purok monthly consumption prediction."
  );
};

export const getPerPurokYearlyPrediction = async (req, res) => {
  const purok = requirePurok(req, res);
  if (!purok) return;

  return sendPrediction(
    res,
    () => generatePerPurokYearlyPrediction(purok),
    "Per purok yearly AI prediction error",
    "Failed to generate purok yearly consumption prediction."
  );
};

export const getAllPuroksMonthlyPrediction = async (req, res) =>
  sendPrediction(
    res,
    generateAllPuroksMonthlyPrediction,
    "All puroks monthly AI prediction error",
    "Failed to generate all puroks monthly consumption predictions."
  );

export const getAllPuroksYearlyPrediction = async (req, res) =>
  sendPrediction(
    res,
    generateAllPuroksYearlyPrediction,
    "All puroks yearly AI prediction error",
    "Failed to generate all puroks yearly consumption predictions."
  );

export const generateAllPredictions = async (req, res) =>
  sendPrediction(
    res,
    generateAllPredictionsService,
    "Generate all AI predictions error",
    "Failed to generate all AI consumption predictions."
  );
