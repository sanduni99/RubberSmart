import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Production endpoints
export const getProduction = async () => {
  const response = await axios.get(`${API_URL}/production`);
  return response.data;
};

export const getPrices = async () => {
  const response = await axios.get(`${API_URL}/prices`);
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};

export const getYearlySummary = async () => {
  const response = await axios.get(`${API_URL}/production/yearly-summary`);
  return response.data;
};

export const getYearlyPriceAvg = async () => {
  const response = await axios.get(`${API_URL}/prices/yearly-avg`);
  return response.data;
};

// Prediction endpoints
export const predictYield = async (months = 6) => {
  const response = await axios.get(`${API_URL}/predict/yield?months=${months}`);
  return response.data;
};

export const predictPrice = async (months = 6) => {
  const response = await axios.get(`${API_URL}/predict/price?months=${months}`);
  return response.data;
};