import React, { useState, useEffect } from "react";
import { Bar, Line } from 'react-chartjs-2';
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
  const [chartData, setChartData] = useState<any>({
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});
  const [isLineChart, setIsLineChart] = useState(false); // toggle chart type

  useEffect(() => {
    setChartData({
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      datasets: [
        {
          label: "Carbon Emissions (kg CO₂)",
          data: [120, 135, 150, 145, 160, 155, 170, 165, 158, 162, 149, 140],
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.4)',
          fill: false,
          tension: 0.4, // smooth line
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
          text: 'Carbon Emissions by Month',
        },
      },
      maintainAspectRatio: false,
    });
  }, []);

  return (
    <div className="w-full md:col-span-2 m-auto p-4 border rounded-lg bg-white space-y-4">
      <button
        onClick={() => setIsLineChart(prev => !prev)}
        className="mb-2 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Switch to {isLineChart ? 'Bar' : 'Line'} Chart
      </button>

      <div className="relative lg:h-[70vh] h-[50vh]">
        {isLineChart ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default ChartToggle;