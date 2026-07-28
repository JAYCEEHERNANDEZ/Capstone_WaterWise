import apiClient from "./apiClient";

//Overall Recommendation API

//Get Overall Monthly Recommendations
export const fetchOverallMonthlyRecommendations = async (options) => {
  const response = await apiClient.get(
    "/recommendation/overall/monthly",
    options,
  );
  return response.data;
};

//Get Overall Yearly Recommendations
export const fetchOverallYearlyRecommendations = async (options) => {
  const response = await apiClient.get(
    "/recommendation/overall/yearly",
    options,
  );
  return response.data;
};

//Purok Recommendation API

//Get Purok Monthly Recommendations
export const fetchPerPurokMonthlyRecommendations = async (purok, options) => {
  const response = await apiClient.get(
    `/recommendation/purok/${encodeURIComponent(purok)}/monthly`,
    options,
  );
  return response.data;
};

//Get Purok Yearly Recommendations
export const fetchPerPurokYearlyRecommendations = async (purok, options) => {
  const response = await apiClient.get(
    `/recommendation/purok/${encodeURIComponent(purok)}/yearly`,
    options,
  );
  return response.data;
};

//All Puroks Recommendation API

//Get All Puroks Monthly Recommendations
export const fetchAllPuroksMonthlyRecommendations = async (options) => {
  const response = await apiClient.get(
    "/recommendation/puroks/monthly",
    options,
  );
  return response.data;
};

//Get All Puroks Yearly Recommendations
export const fetchAllPuroksYearlyRecommendations = async (options) => {
  const response = await apiClient.get(
    "/recommendation/puroks/yearly",
    options,
  );
  return response.data;
};

//All Recommendation API

//Get All Recommendations
export const fetchAllRecommendations = async (options) => {
  const response = await apiClient.get("/recommendation", options);
  return response.data;
};
