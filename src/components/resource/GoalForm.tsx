"use client";
import {useState,  JSX} from "react";
import { Lightbulb, Fuel, Droplet, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { checkGoals, saveGoal ,GoalCheckRequest,GoalCheckResponse} from "@/lib/api/goal";
import { useEffect } from "react";
import { getSubmittedGoalMonths } from "@/lib/api/goal";


type GoalKey = "electricity" | "fuel" | "water" | "waste";

const goals: { icon: JSX.Element; label: string; key: GoalKey }[] = [
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Lightbulb size={40} /></div>, label: "Electricity Usage", key: "electricity" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Fuel size={40} /></div>, label: "Fuel Consumption", key: "fuel" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Droplet size={40} /></div>, label: "Water Consumption", key: "water" },
  { icon: <div className="drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]"><Trash2 size={40} /></div>, label: "Waste Produced", key: "waste" },
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
  //const [month, setMonth] = useState(new Date().getMonth() + 1); // month 1-12
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, "0")); // "01" to "12"
  const [submittedMonths, setSubmittedMonths] = useState<string[]>([]);

  // Fetch submitted months whenever the year changes
  useEffect(() => {
    async function fetchSubmitted() {
      try {
        const months = await getSubmittedGoalMonths(year);
        console.log("Submitted months for year", year, ":", months);

        setSubmittedMonths(months);
         // Auto-select first non-disabled month
      const allMonths = [...Array(12).keys()].map(m => `${year}-${String(m + 1).padStart(2, "0")}`);
      const firstAvailable = allMonths.find(m => !months.includes(m));
      if (firstAvailable) {
       // const firstMonth = parseInt(firstAvailable.split("-")[1], 10);
        const firstMonth = firstAvailable.split("-")[1]; // "07", etc.
       setMonth(firstMonth);
      }
      } catch (err) {
        console.error("Failed to load submitted months", err);
        setSubmittedMonths([]);
      }
    }
    fetchSubmitted();
  }, [year]);
  
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
    // Skip if user did not set a goal
  if(values[category as GoalKey]===0) continue;//skip the goal that the slide is 0
   // Skip if data not available for this category
    if (resultData.results[category]?.dataAvailable === false) continue;
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
    //const selectedMonth = `${year}-${String(month).padStart(2, "0")}`;
    const selectedMonth = `${year}-${month}`; // month already zero-padded string
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
    <div className="max-w-4xl mx-auto p-8">
      
    <div className=" flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8 ">
        {/* Header */}
        <div className="text-center">
          {/*<h1 className="text-2xl font-bold text-gray-900 mb-2">GREENSUITE</h1>*/}
          <h2 className="text-xl font-semibold text-black drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]">REVIEW YOUR SUSTAINABILITY GOALS!</h2>
        </div>
{/* Year & Month Selector */}
        <div className="flex justify-center space-x-4 mb-6 text-black">
          {/* Year */}
<select
  value={year}
  onChange={(e) => setYear(parseInt(e.target.value))}
  className="border-3 border-[#43a243] rounded-xl px-5 py-3"
>
  {getYearsRange(currentYear - 5, currentYear ).map((y) => (
    <option key={y} value={y}>
      {y}
    </option>
  ))}
</select>

{/* Month */}
<select
  value={month}
  //onChange={(e) => setMonth(parseInt(e.target.value))}
  onChange={(e) => setMonth(e.target.value)}
  className="border-3 border-[#43a243] rounded-xl px-5 py-3"
>
  {[...Array(12).keys()].map((m) => {
    //const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
    //const isSubmitted = submittedMonths.includes(monthStr);
    const monthOnly = String(m + 1).padStart(2, "0");
const isSubmitted = submittedMonths.includes(monthOnly);

    console.log("[DEBUG] Year selected:", year);
console.log("[DEBUG] Month list:", [...Array(12).keys()].map((m) => String(m + 1).padStart(2, "0")));
console.log("[DEBUG] Disabled months from backend:", submittedMonths);

    return (
    <option //key={m + 1} value={m + 1}
    key={monthOnly}
    value={monthOnly}
    disabled={isSubmitted}
        title={isSubmitted ? "Goal already submitted for this month" : ""}>
      {String(m + 1).padStart(2, "0")}
    </option>
    );
})}
</select>

        </div>
        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div 
              key={goal.key}
              className="bg-white p-6 rounded-xl shadow-sm  
              hover:shadow-md hover:border-[#43a243] hover:scale-[1.02] transition-all duration-300"
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
            onClick={handleUndo}
            disabled={JSON.stringify(values) === JSON.stringify(previousValues)}
            className="px-8 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RESET
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
  
  <div className="mt-6 bg-white border-3 border-[#43a243] rounded-xl shadow-sm p-6 space-y-4 mb-8">
    
    <h3 className="text-2xl font-bold text-black-800 drop-shadow-[0_2px_1px_rgba(0,0,0,0.1)]">Goal Summary</h3>
{/* Show exact backend message here */}
    <p className="text-lg font-semibold text-gray-700 drop-shadow-sm leading-relaxed">
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
  const dataAvailable = result.dataAvailable ?? true; // assume true if undefined
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
    </div>
  );
}