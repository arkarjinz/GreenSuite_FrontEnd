"use client";
import {useState, useEffect, JSX} from "react";
import { Lightbulb, Fuel, Droplet, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { checkGoals, saveGoal, GoalCheckRequest, GoalCheckResponse } from "@/lib/api/goal";
import { fetchGoalById } from "@/lib/api/goalreport";
import { useRouter } from 'next/navigation';

type GoalKey = "electricity" | "fuel" | "water" | "waste";

const goals: { icon: JSX.Element; label: string; key: GoalKey }[] = [
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Lightbulb size={40} /></div>, label: "Electricity Usage", key: "electricity" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Fuel size={40} /></div>, label: "Fuel Consumption", key: "fuel" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Droplet size={40} /></div>, label: "Water Consumption", key: "water" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Trash2 size={40} /></div>, label: "Waste Produced", key: "waste" },
];

interface Props {
  goalId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

function buildSummaryMessage(resultData: GoalCheckResponse, values: Record<GoalKey, number>) {
  const metGoals: string[] = [];
  const notMetGoals: string[] = [];

  for (const category of Object.keys(resultData.results)) {
    if(values[category as GoalKey] === 0) continue;
    if (resultData.results[category]?.dataAvailable === false) continue;
    
    const isGoalMet = resultData.results[category].goalMet;

    if (isGoalMet) metGoals.push(category);
    else notMetGoals.push(category);
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatList = (list: string[]) => list.map(capitalize).join(", ");

  if (metGoals.length === 0) {
    return "Unfortunately, none of your goals have been met yet.";
  } else if (notMetGoals.length === 0) {
    return "Congratulations! All your goals have been met.";
  } else {
    return `Congratulations! Your goal for ${formatList(metGoals)} has been met, but your goal for ${formatList(notMetGoals)} is not met.`;
  }
}

export default function GoalEditForm({ goalId, searchParams }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for form values
  const [values, setValues] = useState<Record<GoalKey, number>>({
    electricity: 0,
    fuel: 0,
    water: 0,
    waste: 0,
  });

  // State for original values (for comparison)
  const [originalValues, setOriginalValues] = useState<Record<GoalKey, number>>({
    electricity: 0,
    fuel: 0,
    water: 0,
    waste: 0,
  });

  // Goal data state
  const [goalData, setGoalData] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [resultData, setResultData] = useState<GoalCheckResponse | null>(null);

  // Load existing goal data
  useEffect(() => {
    const loadGoalData = async () => {
      try {
        setLoading(true);
        const goal = await fetchGoalById(goalId);
        setGoalData(goal);
        
        // Populate form with existing values
        const existingValues = {
          electricity: goal.targetElectricity || 0,
          fuel: goal.targetFuel || 0,
          water: goal.targetWater || 0,
          waste: goal.targetWaste || 0,
        };
        
        setValues(existingValues);
        setOriginalValues(existingValues);
        
      } catch (err) {
        console.error('Failed to load goal data:', err);
        setError('Failed to load goal data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGoalData();
  }, [goalId]);

  const handleChange = (key: GoalKey, value: number) => {
    setValues(prev => ({ ...prev, [key]: Math.min(100, Math.max(0, value)) }));
  };

  const handleReset = () => {
    setValues(originalValues);
  };

  const handleSubmit = async () => {
    if (!goalData) return;

    try {
      const selectedMonth = `${goalData.year}-${goalData.month}`;
      const request: GoalCheckRequest = {
        selectedMonth,
        targetPercentByCategory: {
          electricity: values.electricity,
          fuel: values.fuel,
          water: values.water,
          waste: values.waste,
        },
      };

      const response = await checkGoals(request);
      console.log("✅ Raw GoalCheckResponse from backend:", response);
      setResultData(response);
      
      await saveGoal(request); // Update the goal
      setResponseMessage("Goal updated successfully.");
      
      // Update original values to reflect the new saved state
      setOriginalValues({...values});

    } catch (error) {
      console.error("Error during goal update:", error);
      setResponseMessage("An error occurred while updating your goal.");
    }
  };

  const handleCancel = () => {
    router.push('/report'); // Navigate back to reports page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading goal data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Button
            onClick={handleCancel}
            className="mt-4 px-6 py-2 bg-gray-600 text-white hover:bg-gray-700"
          >
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-black drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]">
            EDIT SUSTAINABILITY GOALS
          </h2>
          <p className="text-md text-gray-700 mt-2">
            Editing goals for {goalData?.month}/{goalData?.year}
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div 
              key={goal.key}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:border-[#43a243] hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.label}</h3>
                  <p className="text-sm text-gray-800">Reduced By:</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={values[goal.key]}
                      onChange={(e) => handleChange(goal.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-16 text-center font-medium text-gray-900">
                      {values[goal.key]}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <Button
            onClick={handleCancel}
            className="px-8 py-2 bg-gray-500 text-white hover:bg-gray-600"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleReset}
            disabled={JSON.stringify(values) === JSON.stringify(originalValues)}
            className="px-8 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RESET
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 py-2 bg-green-600 text-white hover:bg-green-700"
          >
            UPDATE
          </Button>
        </div>

        {/* Response message */}
        {responseMessage && (
          <p className="mt-4 text-center text-sm text-green-600">{responseMessage}</p>
        )}

        {/* Goal Summary Display */}
        {resultData && (
          <div className="mt-6 bg-white border-3 border-[#43a243] rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-2xl font-bold text-black-800 drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]">Updated Goal Summary</h3>
            <p className="text-lg font-semibold text-gray-700 drop-shadow-sm leading-relaxed">
              {resultData.message}
            </p>

            <p className="text-md font-medium text-gray-700 mb-4">
              {buildSummaryMessage(resultData, values)}
            </p>
            
            {Object.entries(resultData.results).map(([category, result]) => {
              const isGoalMet = result.goalMet;
              const userSelectedValue = values[category as GoalKey];
              
              let displayMessage;
              const dataAvailable = result.dataAvailable ?? true;
              if (userSelectedValue === 0) {
                displayMessage = "Not selected for goal";
              } else if (!dataAvailable) {
                displayMessage = "No data available";
              } else if (isGoalMet) {
                displayMessage = "Goal Met";
              } else {
                displayMessage = `Need ${result.remainingPercent.toFixed(2)}% more`;
              }

              return (
                <div
                  key={category}
                  className="flex justify-between items-center border-t pt-4 first:border-t-0 first:pt-0"
                >
                  <span className="text-lg font-bold text-gray-800 capitalize mb-1 tracking-tight">{category}</span>
                  <span
                    className={`text-base font-semibold ${
                      userSelectedValue === 0
                        ? "text-gray-500"
                        : isGoalMet
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {displayMessage}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}