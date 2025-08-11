/*export const calculateFootprint = async (data: {
  activityType: string;
  value: number;
  region: string;
  month: string;
  fuelType?: string;
  unit?: string;
  disposalMethod?: string;
}) => {
  try {
    // Get token from localStorage directly here
    const token = localStorage.getItem("token");
    console.log("Using Auth token:", token);

    const response = await fetch("http://localhost:8080/api/carbon/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        ...data,
        activityType: data.activityType.toUpperCase(),
        month: data.month.toUpperCase(),
        region: data.region.toUpperCase(),
        fuelType: data.fuelType?.toUpperCase(),
        unit: data.unit?.toUpperCase(),
        disposalMethod: data.disposalMethod?.toUpperCase()
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calculation failed with status:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Calculation successful:', result);
    return result as number;
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};*/
import type { CarbonInput } from "@/types/carbon";

export const calculateFootprint = async (data: CarbonInput[]) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/carbon/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data.map(input => ({
        ...input,
        userId: localStorage.getItem("userId"), 
        activityType: input.activityType.toUpperCase(),
        month: input.month?.toUpperCase(),
        region: input.region?.toUpperCase(),
        fuelType: input.fuelType?.toUpperCase(),
        unit: input.unit?.toUpperCase(),
        disposalMethod: input.disposalMethod?.toUpperCase(),
      }))),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result as number; // or a different type if your backend sends more info
  } catch (error) {
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
//Add this new function to get submitted resource months
export const getSubmittedResourceMonths = async (year: number): Promise<string[]> => {
  try {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    
    console.log("Fetching submitted resource months for year:", year);

    const response = await fetch(`http://localhost:8080/api/carbon/submitted-months?year=${year}&companyId=${companyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Submitted resource months response:", result);
// Assuming the backend returns an array of month strings like ["01", "03", "07"]
    // or full date strings like ["2025-01", "2025-03"] that you need to extract months from
    return result as string[];
    
  } catch (error) {
    console.error("Failed to fetch submitted resource months:", error);
    throw new Error(`Failed to get submitted months: ${error instanceof Error ? error.message : String(error)}`);
  }
};