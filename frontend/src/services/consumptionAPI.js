import apiClient from "./apiClient";

const consumptionAPI = {
  get: (path, options) => apiClient.get(`/consumption${path}`, options),
};

//Get Consumption Ranking
export const fetchConsumptionRanking = async () => {
  const response = await consumptionAPI.get("/ranking");
  return response.data;
};

//History API

//Get Monthly Consumption History
export const fetchMonthlyHistory = async () => {
  const response = await consumptionAPI.get("/history/monthly");
  return response.data;
};

//Get Yearly Consumption History
export const fetchYearlyHistory = async () => {
  const response = await consumptionAPI.get("/history/yearly");
  return response.data;
};

//Get Purok Monthly History
export const fetchPurokMonthlyHistory = async (purok) => {
  const response = await consumptionAPI.get(
    `/history/monthly/purok/${purok}`
  );

  return response.data;
};

//Get Purok Yearly History
export const fetchPurokYearlyHistory = async (purok) => {
  const response = await consumptionAPI.get(
    `/history/yearly/purok/${purok}`
  );

  return response.data;
};

//Get All Puroks Monthly History
export const fetchAllPuroksMonthlyHistory = async () => {
  const response = await consumptionAPI.get(
    "/history/monthly/all-puroks"
  );

  return response.data;
};

//Get All Puroks Yearly History
export const fetchAllPuroksYearlyHistory = async () => {
  const response = await consumptionAPI.get(
    "/history/yearly/all-puroks"
  );

  return response.data;
};

//Generate All History Consumption
export const generateAllHistoryConsumption = async () => {
  const response = await consumptionAPI.get(
    "/history/overall"
  );

  return response.data;
};

export const fetchOverallConsumptionHistory =
  async () => {
    const response = await consumptionAPI.get(
      "/history/overall"
    );

    return response.data;
  };

//Forecast API

//Get Overall Monthly Forecast
export const fetchOverallMonthlyPrediction = async () => {
  const response = await consumptionAPI.get(
    "/prediction/monthly/overall"
  );

  return response.data;
};

//Get Overall Yearly Forecast
export const fetchOverallYearlyPrediction = async () => {
  const response = await consumptionAPI.get(
    "/prediction/yearly/overall"
  );

  return response.data;
};

//Get Per Purok Monthly Forecast
export const fetchPerPurokMonthlyPrediction = async (purok) => {
  const response = await consumptionAPI.get(
    `/prediction/monthly/purok/${purok}`
  );

  return response.data;
};

//Get Per Purok Yearly Forecast
export const fetchPerPurokYearlyPrediction = async (purok) => {
  const response = await consumptionAPI.get(
    `/prediction/yearly/purok/${purok}`
  );

  return response.data;
};

//Get All Puroks Monthly Forecast
export const fetchAllPuroksMonthlyPrediction = async () => {
  const response = await consumptionAPI.get(
    "/prediction/monthly/all-puroks"
  );

  return response.data;
};

//Get All Puroks Yearly Forecast
export const fetchAllPuroksYearlyPrediction = async () => {
  const response = await consumptionAPI.get(
    "/prediction/yearly/all-puroks"
  );

  return response.data;
};

//Generate All Predictions
export const generateAllPredictions = async () => {
  const response = await consumptionAPI.get(
    "/prediction/generate-all"
  );

  return response.data;
};

export default consumptionAPI;
