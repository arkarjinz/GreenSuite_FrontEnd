"use client"

import React, { useState, useEffect } from "react";
import { Bar, Line } from 'react-chartjs-2';
import PieChart from '@/components/Charts/piechart';
import { fetchCarbonTotalsByYear } from '@/lib/api/extractDataForCharts';
import { useAuth } from '@/contexts/AuthContext';


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
console.log(fetchCarbonTotalsByYear); // should log a function

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
  
  console.log("Company ID:", companyId); // should

  const [chartData, setChartData] = useState<any>({
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});
  const [isLineChart, setIsLineChart] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024"); // ✅ moved outside useEffect


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
          color: '#374151', // Tailwind gray-700
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
            <option value="2024" >2024</option>
            <option value="2023" >2023</option>
            <option value="2022" >2022</option>

          </select>
        </div>

        <div className="relative lg:h-[70vh] h-[50vh]">
          {isLineChart ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <PieChart />
      </div>
    </>
  );
};

export default ChartToggle;
