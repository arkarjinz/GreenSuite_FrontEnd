// src/lib/api/carbon.ts
export const calculateFootprint = async (data: {
  activityType: string;
  value: number;
  region: string;
  month: string;
  fuelType?: string;
  unit?: string;
  disposalMethod?: string;
}, token?: string) => {
  try {
    // Enhanced logging
    console.log('Sending carbon calculation request:', data);

    const response = await fetch("http://localhost:8080/api/carbon/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        ...data,
        // Ensure enum values match Java backend exactly
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
};