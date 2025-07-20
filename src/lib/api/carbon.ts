// src/lib/api/carbon.ts
export const calculateFootprint = async (data: {
  activityType: string;
  value: number;
  region: string;
  month: string;
  fuelType?: string;
  unit?: string;  // ← Add this to match VolumeUnit in Java
  disposalMethod?: string;
}, token?: string) => {
  const response = await fetch("http://localhost:8080/api/carbon/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Add if using Spring Security
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Calculation failed");
  return response.json() as Promise<number>; // Backend returns Double
};