// src/types/report.ts
export interface CarbonActivity {
  id: string;
  companyId: string;
  userId: string;
  month: string;
  year: string;
  activityType: string;
  inputValue: number;
  inputUnit: string;
  footprint: number;
  region: string;
  fuelType: string;
  disposalMethod: string;
  timestamp: string; // ISO format
}
