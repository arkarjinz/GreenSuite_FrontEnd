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
}
