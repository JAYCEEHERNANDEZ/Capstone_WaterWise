import apiClient from "./apiClient";

//Overall Anomaly API

//Get Overall Monthly Anomaly
export const fetchOverallMonthlyAnomaly = async (options) => {
  const response = await apiClient.get("/anomaly/overall/monthly", options);
  return response.data;
};

//Get Overall Yearly Anomaly
export const fetchOverallYearlyAnomaly = async (options) => {
  const response = await apiClient.get("/anomaly/overall/yearly", options);
  return response.data;
};

//Purok Anomaly API

//Get Purok Monthly Anomaly
export const fetchPerPurokMonthlyAnomaly = async (purok, options) => {
  const response = await apiClient.get(
    `/anomaly/purok/${encodeURIComponent(purok)}/monthly`,
    options,
  );
  return response.data;
};

//Get Purok Yearly Anomaly
export const fetchPerPurokYearlyAnomaly = async (purok, options) => {
  const response = await apiClient.get(
    `/anomaly/purok/${encodeURIComponent(purok)}/yearly`,
    options,
  );
  return response.data;
};

//All Puroks Anomaly API

//Get All Puroks Monthly Anomaly
export const fetchAllPuroksMonthlyAnomaly = async (options) => {
  const response = await apiClient.get("/anomaly/puroks/monthly", options);
  return response.data;
};

//Get All Puroks Yearly Anomaly
export const fetchAllPuroksYearlyAnomaly = async (options) => {
  const response = await apiClient.get("/anomaly/puroks/yearly", options);
  return response.data;
};

//Generate Anomaly API

//Generate All Anomalies
export const generateAllAnomalies = async (options) => {
  const response = await apiClient.get("/anomaly/all", options);
  return response.data;
};
