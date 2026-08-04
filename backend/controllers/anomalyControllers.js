import {
  generateOverallMonthlyAnomaly,
  generateOverallYearlyAnomaly,
  generatePerPurokMonthlyAnomaly,
  generatePerPurokYearlyAnomaly,
  generateAllPuroksMonthlyAnomaly,
  generateAllPuroksYearlyAnomaly,
  generateAllAnomaliesService,
} from "../services/anomalyServices.js";

// ==========================================
// RESPONSE HELPERS
// ==========================================

const sendSuccess = (
  res,
  data,
  statusCode = 200
) => {
  return res
    .status(statusCode)
    .json({
      success: true,
      data,
    });
};

const sendError = (
  res,
  error,
  statusCode = 500
) => {
  console.error(
    "Anomaly controller error:",
    error
  );

  return res
    .status(statusCode)
    .json({
      success: false,
      message:
        error?.message ||
        "An unexpected error occurred.",
    });
};

const getValidatedPurok = (
  req
) => {
  const purok =
    req.params?.purok?.trim();

  if (!purok) {
    throw new Error(
      "Purok parameter is required."
    );
  }

  return purok;
};

// ==========================================
// OVERALL ANOMALIES
// ==========================================

// Get overall monthly anomaly
export const getOverallMonthlyAnomaly =
  async (req, res) => {
    try {
      const anomaly =
        await generateOverallMonthlyAnomaly();

      return sendSuccess(
        res,
        anomaly
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// Get overall yearly anomaly
export const getOverallYearlyAnomaly =
  async (req, res) => {
    try {
      const anomaly =
        await generateOverallYearlyAnomaly();

      return sendSuccess(
        res,
        anomaly
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// ==========================================
// PER-PUROK ANOMALIES
// ==========================================

// Get monthly anomaly for one purok
export const getPerPurokMonthlyAnomaly =
  async (req, res) => {
    try {
      const purok =
        getValidatedPurok(req);

      const anomaly =
        await generatePerPurokMonthlyAnomaly(
          purok
        );

      return sendSuccess(
        res,
        anomaly
      );
    } catch (error) {
      const statusCode =
        error.message ===
        "Purok parameter is required."
          ? 400
          : 500;

      return sendError(
        res,
        error,
        statusCode
      );
    }
  };

// Get yearly anomaly for one purok
export const getPerPurokYearlyAnomaly =
  async (req, res) => {
    try {
      const purok =
        getValidatedPurok(req);

      const anomaly =
        await generatePerPurokYearlyAnomaly(
          purok
        );

      return sendSuccess(
        res,
        anomaly
      );
    } catch (error) {
      const statusCode =
        error.message ===
        "Purok parameter is required."
          ? 400
          : 500;

      return sendError(
        res,
        error,
        statusCode
      );
    }
  };

// ==========================================
// ALL-PUROKS ANOMALIES
// ==========================================

// Get monthly anomalies for all puroks
export const getAllPuroksMonthlyAnomaly =
  async (req, res) => {
    try {
      const anomalies =
        await generateAllPuroksMonthlyAnomaly();

      return sendSuccess(
        res,
        anomalies
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// Get yearly anomalies for all puroks
export const getAllPuroksYearlyAnomaly =
  async (req, res) => {
    try {
      const anomalies =
        await generateAllPuroksYearlyAnomaly();

      return sendSuccess(
        res,
        anomalies
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// ==========================================
// GENERATE ALL ANOMALIES
// ==========================================

export const generateAllAnomalies =
  async (req, res) => {
    try {
      const anomalies =
        await generateAllAnomaliesService();

      return sendSuccess(
        res,
        anomalies
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };
