// Add these helper functions at the top
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const getUserData = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
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
  //isGoalMet: boolean;        // ← Changed to match backend
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
  const token = getLocalStorageItem("accessToken");


  // ✅ ADD AUTH CHECK
  if (!token) {
    throw new Error('User not authenticated. Please login again.');
  }
  const response = await fetch("http://localhost:8080/api/carbon/goals/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
// ✅ HANDLE 401 UNAUTHORIZED
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
export async function saveGoal(request: GoalCheckRequest): Promise<void> {
  const token = getLocalStorageItem("accessToken");
 
  // ✅ ADD AUTH CHECK
  if (!token) {
    throw new Error('User not authenticated. Please login again.');
  }
  const response = await fetch(`http://localhost:8080/api/carbon/goals/save?`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });
// ✅ HANDLE 401 UNAUTHORIZED
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Session expired. Please login again.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}
//to disable the selected month in the dropdown
export async function getSubmittedGoalMonths(year:number): Promise<string[]> {
  const token = getLocalStorageItem("accessToken");
const userData = getUserData();
  const companyId = userData?.companyId;

  // ✅ ADD AUTH CHECK
  if (!token) {
    console.log("No authentication token available, returning empty months array");
    return [];
  }
  if (!companyId) {
    console.log("No company ID available, returning empty months array");
    return [];
  }

  
  console.log("Fetching submitted goal months for year:", year);

  // You can send year as a query param if needed, or just fetch all submitted months
  const response = await fetch(`http://localhost:8080/api/carbon/goals/submittedMonths?year=${year}&companyId=${companyId}`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",Authorization: `Bearer ${token}`, 
    },
  });
// ✅ HANDLE 401 UNAUTHORIZED
  if (response.status === 401) {
    console.log("Unauthorized access - token may be expired");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return [];
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    //throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  console.error("Error fetching submitted goal months:", errorData);
    return[];
  }

  const data: string[] = await response.json();
  return data;
}
