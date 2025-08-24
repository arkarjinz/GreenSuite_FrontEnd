import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/carbon'; 

export const fetchCarbonTotalsByYearAndMonth = async (
  companyId: string,
  year: string,
  month: string
) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await axios.get(`${API_BASE_URL}/company/${companyId}/breakdown`, {
    params: {
      year,
      month
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};