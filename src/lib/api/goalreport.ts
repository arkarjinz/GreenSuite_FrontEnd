// src/lib/api/goalreport.ts
import axiosInstance from "@/lib/api/axiosInstance"; // this includes JWT

import type { CarbonGoal } from "@/types/goalreport"; // or whatever type you use
/*export async function fetchGoalData() {
  const res = await fetch('/api/carbon/goals');
  if (!res.ok) throw new Error('Failed to fetch goal data');
  return res.json();
}*/
export const fetchGoalData = async (): Promise<CarbonGoal[]> => {
  const response = await axiosInstance.get('/api/carbon/goals');
  return response.data;
};
