// src/services/reports.js
import api from "./api";

export const getFinancialReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(`/orders/reports/financial?${params.toString()}`);
  return response.data;
};
