import {
  generateOverallMonthlyRecommendations,
  generateOverallYearlyRecommendations,
  generatePerPurokMonthlyRecommendations,
  generatePerPurokYearlyRecommendations,
  generateAllPuroksMonthlyRecommendations,
  generateAllPuroksYearlyRecommendations,
  generateAllRecommendationsService,
} from "../services/recommendationServices.js";

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
    "Recommendation controller error:",
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
// OVERALL RECOMMENDATIONS
// ==========================================

// Get overall monthly recommendations
export const getOverallMonthlyRecommendations =
  async (req, res) => {
    try {
      const data =
        await generateOverallMonthlyRecommendations();

      return sendSuccess(
        res,
        data
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// Get overall yearly recommendations
export const getOverallYearlyRecommendations =
  async (req, res) => {
    try {
      const data =
        await generateOverallYearlyRecommendations();

      return sendSuccess(
        res,
        data
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// ==========================================
// PER-PUROK RECOMMENDATIONS
// ==========================================

// Get monthly recommendations for one purok
export const getPerPurokMonthlyRecommendations =
  async (req, res) => {
    try {
      const purok =
        getValidatedPurok(req);

      const data =
        await generatePerPurokMonthlyRecommendations(
          purok
        );

      return sendSuccess(
        res,
        data
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

// Get yearly recommendations for one purok
export const getPerPurokYearlyRecommendations =
  async (req, res) => {
    try {
      const purok =
        getValidatedPurok(req);

      const data =
        await generatePerPurokYearlyRecommendations(
          purok
        );

      return sendSuccess(
        res,
        data
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
// ALL-PUROKS RECOMMENDATIONS
// ==========================================

// Get monthly recommendations for all puroks
export const getAllPuroksMonthlyRecommendations =
  async (req, res) => {
    try {
      const data =
        await generateAllPuroksMonthlyRecommendations();

      return sendSuccess(
        res,
        data
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// Get yearly recommendations for all puroks
export const getAllPuroksYearlyRecommendations =
  async (req, res) => {
    try {
      const data =
        await generateAllPuroksYearlyRecommendations();

      return sendSuccess(
        res,
        data
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };

// ==========================================
// GENERATE ALL RECOMMENDATIONS
// ==========================================

export const getAllRecommendations =
  async (req, res) => {
    try {
      const data =
        await generateAllRecommendationsService();

      return sendSuccess(
        res,
        data
      );
    } catch (error) {
      return sendError(
        res,
        error
      );
    }
  };
