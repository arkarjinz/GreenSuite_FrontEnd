import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ dataValues }: { dataValues: number[] }) => {
  const labels = ['Electricity', 'Fuels', 'Water', 'Waste'];
  const colors = [
    'rgba(255, 99, 132, 0.6)',   // Electricity
    'rgba(54, 162, 235, 0.6)',   // Fuels
    'rgba(255, 206, 86, 0.6)',   // Water
    'rgba(24, 229, 147, 0.6)',   // Waste
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Emissions Breakdown (%)',
        data: dataValues,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const total = dataValues.reduce((sum, value) => sum + value, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Add this to allow custom sizing
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const value = tooltipItem.raw;
            const percent = ((value / total) * 100).toFixed(2);
            const label = data.labels[tooltipItem.dataIndex];
            return `${label}: ${value.toLocaleString()} (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="border-3 border-[#43a243] rounded-xl shadow-sm w-full max-w-md mx-auto p-4 bg-white">
      <h2 className="text-lg font-semibold text-green-800 mb-4 text-center">
        Carbon Emissions Breakdown
      </h2>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="w-40 h-40"> {/* Reduced size */}
          <Pie data={data} options={options} />
        </div>
        <div className="flex flex-col gap-2 text-sm"> {/* Smaller text and gaps */}
          {labels.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;