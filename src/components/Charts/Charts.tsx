"use client"

import React, { useState, useEffect } from "react";
import { Bar, Line } from 'react-chartjs-2';
import PieChart from '@/components/Charts/piechart';
import { fetchCarbonTotalsByYear } from '@/lib/api/extractDataForCharts';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCarbonTotalsByYearAndMonth } from "@/lib/api/extractCarbonBreakdown";
import type { CarbonActivity } from "@/types/carbon";



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

  const handleChartClick = (event: any, elements: any[]) => {
    if (!elements.length) return;

    const index = elements[0].index;
    setSelectedMonthIndex(index);
    fetchPieBreakdownData(index + 1);
  };




  const [chartData, setChartData] = useState<any>({
    datasets: [],
  });



  const [chartOptions, setChartOptions] = useState({});
  const [isLineChart, setIsLineChart] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2022"); // ✅ moved outside useEffect

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




  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    updateChartForYear(year);
  };

  const updateChartForYear = async (year: string) => {
    setSelectedYear(year);

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
      <div className="w-full md:col-span-2 m-auto p-4 border rounded-lg bg-white space-y-4">
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
            <option value="2021" >2021</option>
            <option value="2022" >2022</option>
            <option value="2023" >2023</option>
            <option value="2024" >2024</option>
            <option value="2025" >2025</option>
            <option value="2026" >2026</option>
            <option value="2027" >2027</option>
            <option value="2028" >2028</option>
            <option value="2029" >2029</option>
            <option value="2030" >2030</option>

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
          Here will be the goal
          </div>
      </div>
    </>
  );
};

export default ChartToggle;
