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
// ===== NEW FUNCTIONS FOR EDIT FUNCTIONALITY =====

// Type definitions for edit functionality
export interface GetResourceDataParams {
  month: string;
  year: string;
  region: string;
}

export interface ExistingResourceData {
  electricity?: number;
  water?: number;
  fuel?: number;
  waste?: number;
  fuelType?: "gasoline" | "diesel" | "naturalGas";
  unit?: "LITERS" | "CUBIC_METERS";
  disposalMethod?: "recycled" | "landfilled" | "incinerated";
  region: string;
  month: string;
  year: string;
}

export interface UpdateFootprintParams {
  month: string;
  year: string;
  region: string;
}
/**
 * Fetch existing resource data for a specific month/year/region for editing
 */
export const getResourceDataForMonth = async (
  params: GetResourceDataParams
): Promise<ExistingResourceData | null> => {
  try {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    
    console.log("Fetching resource data for editing:", params);

    const queryParams = new URLSearchParams({
      month: params.month.toUpperCase(),
      year: params.year,
      region: params.region.toUpperCase(),
      companyId: companyId || '',
    });

    const response = await fetch(`http://localhost:8080/api/carbon/resource-data?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No existing data found for this period");
        return null; // No data found for this period
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved existing resource data:", data);
    return data as ExistingResourceData;
  } catch (error) {
    console.error('Error fetching existing resource data:', error);
    throw new Error(`Failed to fetch resource data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Update existing footprint data
 */
/*export const updateFootprint = async (
  inputs: CarbonInput[],
  params: UpdateFootprintParams
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    
    console.log("Updating footprint data:", { inputs, params });

    const response = await fetch('http://localhost:8080/api/carbon/update', {
      method: 'PUT', // Use PUT for updates
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        inputs: inputs.map(input => ({
          ...input,
          userId: localStorage.getItem("userId"),
          companyId: companyId,
          activityType: input.activityType.toUpperCase(),
          month: input.month?.toUpperCase(),
          region: input.region?.toUpperCase(),
          fuelType: input.fuelType?.toUpperCase(),
          unit: input.unit?.toUpperCase(),
          disposalMethod: input.disposalMethod?.toUpperCase(),
        })),
        month: params.month.toUpperCase(),
        year: params.year,
        region: params.region.toUpperCase(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Update failed with status:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Update successful:', result);
    return result;
  } catch (error) {
    console.error('Error updating footprint:', error);
    throw new Error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};*/
export const updateFootprint = async (
  inputs: CarbonInput[],
  params: UpdateFootprintParams
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    
    // Create query parameters
    const queryParams = new URLSearchParams({
      month: params.month.toUpperCase(),
      year: params.year,
      region: params.region.toUpperCase()
    });

    const response = await fetch(
      `http://localhost:8080/api/carbon/update?${queryParams}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        // Send JUST the array in body
        body: JSON.stringify(inputs.map(input => ({
          ...input,
          userId: localStorage.getItem("userId"),
          companyId: localStorage.getItem("companyId"),
          activityType: input.activityType.toUpperCase(),
          month: input.month?.toUpperCase(),
          region: input.region?.toUpperCase(),
          fuelType: input.fuelType?.toUpperCase(),
          unit: input.unit?.toUpperCase(),
          disposalMethod: input.disposalMethod?.toUpperCase(),
        })))
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
//to show result for calculated footprint
/*export const getChartData = async (month: string, year: string, region: string) => {
  const response = await fetch(`/api/carbon/chart-data?month=${month}&year=${year}&region=${region}`);
  if (!response.ok) throw new Error('Failed to fetch chart data');
  return await response.json();
};*/
// Add this to your carbon.ts file (replace the existing getChartData function)

export const getChartData = async (month: string, year: string, region: string) => {
  try {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    
    console.log("Fetching chart data for:", { month, year, region });

    const queryParams = new URLSearchParams({
      month: month.toUpperCase(),
      year: year,
      region: region.toUpperCase(),
      ...(companyId && { companyId: companyId }),
    });

    const response = await fetch(`http://localhost:8080/api/carbon/chart-data?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Chart data fetch failed:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Chart data retrieved successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
    throw new Error(`Failed to fetch chart data: ${error instanceof Error ? error.message : String(error)}`);
  }
};