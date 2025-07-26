import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const labels = ['Electricity', 'Fuels', 'Water', 'Waste', 'Recycle'];
  const colors = [
    'rgba(255, 99, 132, 0.6)',   // Electricity
    'rgba(54, 162, 235, 0.6)',   // Fuels
    'rgba(255, 206, 86, 0.6)',   // Water
    'rgba(75, 192, 192, 0.6)',   // Waste
    'rgba(153, 102, 255, 0.6)',  // Recycle
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Emissions Breakdown (%)',
        data: [35, 25, 15, 15, 10],
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // We use a custom legend
      title: { display: false },  // Disable chart title
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Custom header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Carbon Emissions Breakdown
      </h2>

      {/* Flex layout for pie and legend */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="w-64 h-64">
          <Pie data={data} options={options} />
        </div>

        <div className="flex flex-col gap-3">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-gray-700 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
