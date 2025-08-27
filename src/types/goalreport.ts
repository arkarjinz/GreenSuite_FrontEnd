export interface CarbonGoal {
  id: string;
  companyId: string;
  userId?: string;
  
  month: string;
  year: string;
  targetElectricity?: number;
  targetFuel?: number;
  targetWater?: number;
  targetWaste?: number;
  electricityGoalMet?: boolean;
  fuelGoalMet?: boolean;
  waterGoalMet?: boolean;
  wasteGoalMet?: boolean;
  electricityRemaining?: number;
  fuelRemaining?: number;
  waterRemaining?: number;
  wasteRemaining?: number;
  electricityReduction?: number;
  waterReduction?: number;
  fuelReduction?: number;
  wasteReduction?: number;
  isMet?: boolean;
  createdAt?: string; // or Date, if you parse it
  updatedAt?: string;
  // Add these new fields
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  company?: {
    id: string;
    name: string;
  };
}
// Add by Htet Htet
export interface GoalSummaryResponse {
  message: string;
  results: {
    electricity?: CategoryResult;
    fuel?: CategoryResult;
    water?: CategoryResult;
    waste?: CategoryResult;
  };
  electricityGoalMet: boolean;
  fuelGoalMet: boolean;
  waterGoalMet: boolean;
  wasteGoalMet: boolean;
}

interface CategoryResult {
  reductionPercent: number;
  remainingPercent: number;
  dataAvailable: boolean;
  goalMet: boolean;
}