export interface GoalPercentages {
  electricity: number;
  fuel: number;
  water: number;
  waste: number;
}

export interface GoalCheckRequest {
  selectedMonth: string; // format: "2024-07"
  targetPercentByCategory: GoalPercentages;
}

export interface CategoryResult {
  //isMet: boolean;
  goalMet: boolean;
  achievedPercent: number;
  remainingPercent: number;
  dataAvailable?: boolean;
}
// Adjust your interface in goal.ts
export interface GoalCheckResponse {
  message: string;
  results: Record<string, CategoryResult>;
  electricityGoalMet: boolean;
  fuelGoalMet: boolean;
  waterGoalMet: boolean;
  wasteGoalMet: boolean;
}

/*export interface GoalCheckResponse {
  message: string;
  results: Record<string, CategoryResult>;
}*/

export async function checkGoals(request: GoalCheckRequest): Promise<GoalCheckResponse> {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/carbon/goals/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
export async function saveGoal(request: GoalCheckRequest): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080/api/carbon/goals/save?`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}
//to disable the selected month in the dropdown
export async function getSubmittedGoalMonths(year:number): Promise<string[]> {
  const token = localStorage.getItem("token");

  // You can send year as a query param if needed, or just fetch all submitted months
  const response = await fetch(`http://localhost:8080/api/carbon/goals/submittedMonths?year=${year}`, {
    method: "GET",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data: string[] = await response.json();
  return data;
}
