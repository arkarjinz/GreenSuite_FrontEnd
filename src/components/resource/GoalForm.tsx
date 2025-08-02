"use client";
import {useState,  JSX} from "react";
import { Lightbulb, Fuel, Droplet, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { checkGoals, saveGoal ,GoalCheckRequest,GoalCheckResponse} from "@/lib/api/goal";
import { useEffect } from "react";



type GoalKey = "electricity" | "fuel" | "water" | "waste";

const goals: { icon: JSX.Element; label: string; key: GoalKey }[] = [
  { icon: <Lightbulb size={40} />, label: "Electricity Usage", key: "electricity" },
  { icon: <Fuel size={40} />, label: "Fuel Consumption", key: "fuel" },
  { icon: <Droplet size={40} />, label: "Water Consumption", key: "water" },
  { icon: <Trash2 size={40} />, label: "Waste Produced", key: "waste" },
];
function getCurrentYear() {
  return new Date().getFullYear();
}

function getYearsRange(startYear: number, endYear: number) {
  const years = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}
export default function SustainabilityGoals() {
 const currentYear = getCurrentYear();

  // Add these state variables
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // month 1-12
  const [values, setValues] = useState<Record<GoalKey, number>>({
    electricity: 0,
    fuel: 0,
    water: 0,
    waste: 0,
  });
  
  //function buildSummaryMessage(results: GoalCheckResponse["results"]) {
  function buildSummaryMessage(resultData: GoalCheckResponse) {
  const metGoals: string[] = [];
  const notMetGoals: string[] = [];

  

for (const category of Object.keys(resultData.results)) {
   if(values[category as GoalKey]===0) continue;//skip the goal that the slide is 0
   const isGoalMet = resultData.results[category].goalMet;

console.log(`🔍 Checking ${category}:`, {
    //goalMetField,
    isGoalMet,
     userSet: values[category as GoalKey],
    remaining: resultData.results[category]?.remainingPercent,
  });
  if (isGoalMet) metGoals.push(category);
  else notMetGoals.push(category);
}
/*for (const category of Object.keys(resultData.results)) {
  // Skip categories the user did not select (e.g., slider was left at 0)
  if (values[category as GoalKey] === 0) continue;

  const isGoalMet = resultData.results[category].goalMet;

  console.log(`🔍 Checking ${category}:`, {
    isGoalMet,
    remaining: resultData.results[category]?.remainingPercent,
  });

  if (isGoalMet) metGoals.push(category);
  else notMetGoals.push(category);
}
*/

  // Capitalize categories nicely
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


  const [previousValues, setPreviousValues] = useState<Record<GoalKey, number>>({...values});
//const [responseMessage, setResponseMessage] = useState<string | null>(null);
  /*const user = getUser();
  const companyId = user?.companyId;*/
  const handleChange = (key: GoalKey, value: number) => {
    setPreviousValues({...values});
    setValues(prev => ({ ...prev, [key]: Math.min(100, Math.max(0, value)) }));
  };

  const handleUndo = () => {
    setValues({electricity:0,fuel:0,water:0,waste:0,});
  };

  
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

/*const [resultData, setResultData] = useState<{ 
  message: string; 
  results: Record<string, { 
    isGoalMet: boolean; 
    remainingPercent: number; 
  }>
} | null>(null);*/
 const [resultData, setResultData] = useState<GoalCheckResponse | null>(null);

  /*const handleSubmit = async () => {
  const selectedMonth = `${year}-${String(month).padStart(2, "0")}`;

  try {
    const response = await checkGoals({
      selectedMonth,
      targetPercentByCategory: values,
    });
    setResponseMessage(response.message); // show result nicely
  } catch (error) {
    setResponseMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};*/
const handleSubmit = async () => {
  try {
    const selectedMonth = `${year}-${String(month).padStart(2, "0")}`;

    const request: GoalCheckRequest = {
      selectedMonth,
      targetPercentByCategory: {
        electricity: values.electricity,
        fuel: values.fuel,
        water: values.water,
        waste: values.waste,
      },
    };

     const response=await checkGoals(request);
   console.log("✅ Raw GoalCheckResponse from backend:", response);
     setResultData(response);
    await saveGoal(request); // save after checking
    setResponseMessage("Goal analysis complete.");


    
setResponseMessage("Goal analysis complete.");
  } catch (error) {
    console.error("Error during goal check or save:", error);
    setResponseMessage("An error occurred while processing your goal.");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/*<h1 className="text-2xl font-bold text-gray-900 mb-2">GREENSUITE</h1>*/}
          <h2 className="text-xl font-semibold text-gray-700 drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]">LETS SET YOUR SUSTAINABILITY GOALS!</h2>
        </div>
{/* Year & Month Selector */}
        <div className="flex justify-center space-x-4 mb-6">
          {/* Year */}
<select
  value={year}
  onChange={(e) => setYear(parseInt(e.target.value))}
  className="border border-gray-300 rounded px-3 py-2"
>
  {getYearsRange(currentYear - 5, currentYear + 1).map((y) => (
    <option key={y} value={y}>
      {y}
    </option>
  ))}
</select>

{/* Month */}
<select
  value={month}
  onChange={(e) => setMonth(parseInt(e.target.value))}
  className="border border-gray-300 rounded px-3 py-2"
>
  {[...Array(12).keys()].map((m) => (
    <option key={m + 1} value={m + 1}>
      {String(m + 1).padStart(2, "0")}
    </option>
  ))}
</select>

        </div>
        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div 
              key={goal.key}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 
              hover:shadow-md hover:border-green-200 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{goal.label}</h3>
                  <p className="text-sm text-gray-500">Reduced By:</p>
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
            onClick={handleUndo}
            disabled={JSON.stringify(values) === JSON.stringify(previousValues)}
            className="px-8 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            UNDO
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 py-2 bg-green-600 text-white hover:bg-green-700"
          >
            SUBMIT
          </Button>
          {/* Response message below the buttons */}
{responseMessage && (
  <p className="mt-4 text-center text-sm text-green-600">{responseMessage}</p>
)}
        </div>
        {/* Goal Summary Display */}
        
{resultData && (
  
  <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
    
    <h3 className="text-lg font-semibold text-gray-800">Goal Summary</h3>
{/* Show exact backend message here */}
    <p className="text-md font-medium text-gray-700 mb-4">
      {resultData.message}
    </p>


{/* Add the summary message here */}
    <p className="text-md font-medium text-gray-700 mb-4">
      {/*buildSummaryMessage(resultData.results)*/}
      
      {buildSummaryMessage(resultData)}
    </p>
    {Object.entries(resultData.results).map(([category, result]) => {
      
    const isGoalMet = result.goalMet;

console.log(`🖼️ Rendering result:`, {
    category,
   // goalMetField,
    isGoalMet,
    result,
  });
    // Check if user inputted a goal (assuming zero means not selected)
  const userSelectedValue = values[category as GoalKey]; // your current slider value for that category

  // Determine display message
  let displayMessage;
  if (userSelectedValue === 0) {
    displayMessage = "Not selected for goal";
  } else if (result === undefined) {
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
        <span className="capitalize text-gray-600">{category}</span>
        <span
          className={`font-medium ${
    userSelectedValue === 0
      ? "text-gray-500"
      : isGoalMet
      ? "text-green-600"
      : "text-red-500"
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