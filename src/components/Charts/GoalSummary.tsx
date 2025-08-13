"use client"

import React from "react";

interface CategoryResult {
  reductionPercent: number;
  remainingPercent: number;
  dataAvailable: boolean;
  goalMet: boolean;
}

interface GoalSummaryProps {
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

const GoalSummary: React.FC<GoalSummaryProps> = ({
  message,
  results,
  electricityGoalMet,
  fuelGoalMet,
  waterGoalMet,
  wasteGoalMet
}) => {
  const buildSummaryMessage = () => {
    const metCount = [
      electricityGoalMet,
      fuelGoalMet,
      waterGoalMet,
      wasteGoalMet
    ].filter(Boolean).length;
    
    const totalCategories = 4;
    
    if (metCount === totalCategories) {
      return 'All goals met for this month! Excellent work!';
    }
    
    if (metCount === 0) {
      return 'No goals met yet this month. Keep working on it!';
    }
    
    return `${metCount} out of ${totalCategories} goals met this month. Excellent work!`;
  };

return (
  <div className="mt-8 bg-white border-2 border-[#43a243] rounded-lg shadow-sm p-4 space-y-3 mb-6">
    <h3 className="text-xl font-bold text-black-800">
      Goal Summary
    </h3>
    
    <p className="text-base font-semibold text-gray-700">
      {message}
    </p>
    
    <p className="text-sm font-medium text-gray-700 mb-3">
      {buildSummaryMessage()}
    </p>
    
    {Object.entries(results).map(([category, result]) => {
      if (!result) return null;
      
      let displayMessage;
      if (!result.dataAvailable) {
        displayMessage = "No data";
      } else if (result.goalMet) {
        displayMessage = `Met (${result.reductionPercent.toFixed(2)}% ↓)`;
      } else {
        displayMessage = `${result.remainingPercent.toFixed(2)}% needed`;
      }

      return (
        <div
          key={category}
          className="flex justify-between items-center border-t pt-3 first:border-t-0 first:pt-0"
        >
          <span className="text-base font-bold text-gray-800 capitalize">
            {category}
          </span>
          <span
            className={`text-sm font-semibold ${
              !result.dataAvailable
                ? "text-gray-500"
                : result.goalMet
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
);
};

export default GoalSummary;