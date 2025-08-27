// src/types/report.ts
export interface CarbonActivity {
  id: string;
  companyId: string;
  userId: string;
  username:string;
  month: string;
  year: string;
  activityType: string;
  value: number;
  unit: string;
  footprint: number;
  region: string;
  fuelType: string;
  disposalMethod: string;
  submittedAt: string; // ISO format
  
}
