import type { CarbonInput } from "@/types/carbon";
// Helper function to safely access localStorage only on client side
const getLocalStorageItem = (key: string): string | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Add this helper function at the very top of carbon.ts
const getUserData = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
// Add this function to check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = getLocalStorageItem('accessToken');
  const userData = getUserData();
  return !!token && !!userData?.id;
};

export const calculateFootprint = async (data: CarbonInput[]) => {
  try {
    // Check authentication first
    if (!isAuthenticated()) {
      throw new Error('User not authenticated. Please login again.');
    }
    // Changed from "token" to "accessToken" to match your auth system
    //const token = localStorage.getItem("accessToken");
 const token=getLocalStorageItem("accessToken");
    const userData = getUserData(); // Get user data
    console.log("Token exists:", !!token);
    console.log("User data:", userData);
    console.log("Request data:", data);

 const response = await fetch("http://localhost:8080/api/carbon/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data.map(input => ({
        ...input,
        //userId: localStorage.getItem("userId"), 
         userId: userData?.id, // FIXED: Get from userData, not localStorage
        companyId: userData?.companyId, // FIXED: Get from userData, not localStorage
         activityType: input.activityType.toUpperCase(),
        month: input.month?.toUpperCase(),
        region: input.region?.toUpperCase(),
        fuelType: input.fuelType?.toUpperCase(),
        unit: input.unit?.toUpperCase(),
        disposalMethod: input.disposalMethod?.toUpperCase(),
      }))),
    });
console.log("Response status:", response.status);
   // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      // Clear invalid auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      throw new Error('Session expired. Please login again.');
    }
if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result as number;
  } catch (error) {
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Add this new function to get submitted resource months
export const getSubmittedResourceMonths = async (year: number): Promise<string[]> => {
  try {
    // Changed from "token" to "accessToken"
    const token = getLocalStorageItem("accessToken");
    //const companyId = localStorage.getItem("companyId");
    const userData = getUserData();
    const companyId = userData?.companyId;
    // ✅ ADD THIS CHECK - If no token, return empty array instead of error
    if (!token) {
      console.log("No authentication token available, returning empty months array");
      return [];
    }

    // ✅ ADD THIS CHECK - If no companyId, return empty array
    if (!companyId) {
      console.log("No company ID available, returning empty months array");
      return [];
    }
    console.log("Fetching submitted resource months for year:", year);

    const response = await fetch(`http://localhost:8080/api/carbon/submitted-months?year=${year}&companyId=${companyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` ,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Submitted resource months response:", result);
    return result as string[];
    
  } catch (error) {
     return [];
  }
};

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
    // Changed from "token" to "accessToken"
   // const token = localStorage.getItem("accessToken");
    const token=getLocalStorageItem("accessToken");
   //const companyId = localStorage.getItem("companyId");
    const userData = getUserData();
const companyId = userData?.companyId;
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
        return null;
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
export const updateFootprint = async (
  inputs: CarbonInput[],
  params: UpdateFootprintParams
): Promise<any> => {
  try {
    // Changed from "token" to "accessToken"
    //const token = localStorage.getItem("accessToken");
     const token=getLocalStorageItem("accessToken");
    const userData = getUserData(); // Get user data
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
        body: JSON.stringify(inputs.map(input => ({
          ...input,
          //userId: localStorage.getItem("userId"),
          //companyId: localStorage.getItem("companyId"),
           userId: userData?.id, // FIXED: Get from userData
          companyId: userData?.companyId, // FIXED: Get from userData
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

export const getChartData = async (month: string, year: string, region: string) => {
  try {
    // Changed from "token" to "accessToken"
    //const token = localStorage.getItem("accessToken");
    const token=getLocalStorageItem("accessToken");
    //const companyId = localStorage.getItem("companyId");
    const userData = getUserData();
const companyId = userData?.companyId;
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