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
  isMet: boolean;
  achievedPercent: number;
  remainingPercent: number;
}

export interface GoalCheckResponse {
  message: string;
  results: Record<string, CategoryResult>;
}

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
