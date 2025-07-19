// lib/api/carbon.ts
import { getAuthToken } from './auth'; // Reuse your existing auth utility

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const calculateFootprint = async (data: {
  activityType: string;
  value: number;
  region?: string;
  fuelType?: string;
  disposalMethod?: string;
  unit?: string;
  month?: string;
}) => {
  const response = await fetch(`${API_BASE}/api/carbon/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}` // Using your existing auth
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Calculation failed');
  }

  return await response.json();
};

export const fetchCalculationHistory = async () => {
  const response = await fetch(`${API_BASE}/api/carbon/history`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  // ... similar error handling
};