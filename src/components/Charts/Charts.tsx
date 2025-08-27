"use client"
import axios from "axios";

import React, { useState, useEffect } from "react";
import { Bar, Line } from 'react-chartjs-2';
import PieChart from '@/components/Charts/piechart';
import GoalSummary from '@/components/Charts/GoalSummary';
import { fetchCarbonTotalsByYear } from '@/lib/api/extractDataForCharts';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCarbonTotalsByYearAndMonth } from "@/lib/api/extractCarbonBreakdown";
import type { CarbonActivity } from "@/types/carbon";
import type { GoalSummaryResponse } from '@/types/goalreport';




import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

interface CarbonDataItem {
  month: string;
  totalFootprint: number;
}

type ActivityType = CarbonActivity["activityType"];


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartToggle = () => {

  const { user } = useAuth();
  const companyId = user?.companyId;
  if (!companyId) return;
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [pieData, setPieData] = useState<number[]>([0, 0, 0, 0, 0]); // Placeholder
 const [chartData, setChartData] = useState<any>({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});
  const [isLineChart, setIsLineChart] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [goalData, setGoalData] = useState<GoalSummaryResponse | null>(null);

  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => 2020 + i
  );
  const handleChartClick = (event: any, elements: any[]) => {
    if (!elements.length) return;

    const index = elements[0].index;
    setSelectedMonthIndex(index);
    fetchPieBreakdownData(index + 1);
    fetchGoalData(index + 1);
  };




  

  const fetchPieBreakdownData = async (month: number) => {
    if (!companyId) return;
    try {
      const response = await fetchCarbonTotalsByYearAndMonth(companyId, selectedYear, String(month));

      const breakdown: Record<ActivityType, number> = {
        ELECTRICITY: 0,
        FUEL: 0,
        WATER: 0,
        WASTE: 0,
      };



      for (const item of response) {
        const { activityType, footprint } = item;
        if (activityType in breakdown) {
          breakdown[activityType as ActivityType] += footprint;
        }
      }

      const orderedData = [
        breakdown.ELECTRICITY,
        breakdown.FUEL,
        breakdown.WATER,
        breakdown.WASTE,
      ];

      setPieData(orderedData);
    } catch (error) {
      console.error("Error fetching breakdown:", error);
    }
  };


const fetchGoalData = async (month: number) => {
  if (!companyId) return;

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No token found");

    const monthStr = String(month).padStart(2, '0');
    const response = await fetch(
      `http://localhost:8080/api/carbon/goals/monthly?month=${monthStr}&year=${selectedYear}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch goal data");
    }

    const data = await response.json();
    setGoalData(data);
  } catch (error) {
    console.error("Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      month,
      year: selectedYear,
    });
    setGoalData(null);
  }
};

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    updateChartForYear(year);
  };

  const updateChartForYear = async (year: string) => {
    setSelectedYear(year);
    setGoalData(null);

    const data: CarbonDataItem[] = await fetchCarbonTotalsByYear(companyId, year);
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const footprintByMonth = new Array(12).fill(0);

    data.forEach((item) => {
      const monthIndex = parseInt(item.month, 10) - 1;
      footprintByMonth[monthIndex] = item.totalFootprint;
    });

    setChartData({
      labels: monthLabels,
      datasets: [
        {
          label: `Carbon Emissions`,
          data: footprintByMonth,
          backgroundColor: '#45CB85',
          borderColor: '#45CB85',
        },
      ]
    });

    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Carbon Emissions Overview for ${year}`,
          font: {
            size: 18,
          },
          color: '#2e693cff', // Tailwind gray-700
        },
      }
    });
  };

  useEffect(() => {
    updateChartForYear(selectedYear);
  }, []);




  return (
    <>
      <div className="w-full md:col-span-2 m-auto p-4 border-3 border-[#43a243] rounded-xl shadow-sm bg-white space-y-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsLineChart(prev => !prev)}
            className="mb-2 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Switch to {isLineChart ? 'Bar' : 'Line'} Chart
          </button>

          <select
            className="text-sm border border-gray-300 rounded px-4 py-1"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}

          </select>
        </div>

        <div className="relative lg:h-[70vh] h-[50vh]">
          {isLineChart ? (
            <Line
              data={chartData}
              options={{
                ...chartOptions,
                onClick: handleChartClick,
              }} />
          ) : (
            <Bar
              data={chartData}
              options={{
                ...chartOptions,
                onClick: handleChartClick,
              }}
            />)}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <PieChart dataValues={pieData} />

        <div className="bg-green">
          {goalData && (
            <GoalSummary
              message={goalData.message}
              results={goalData.results}
              electricityGoalMet={goalData.electricityGoalMet}
              fuelGoalMet={goalData.fuelGoalMet}
              waterGoalMet={goalData.waterGoalMet}
              wasteGoalMet={goalData.wasteGoalMet}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ChartToggle;