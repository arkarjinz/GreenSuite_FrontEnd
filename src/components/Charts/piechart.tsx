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
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-green-800 mb-6 text-center">
        Carbon Emissions Breakdown
      </h2>
      <div className="flex flex-row md:flex-row gap-8 items-center justify-center">
        <div className="w-64 h-64">
          <Pie data={data} options={options} />
        </div>
        <div className="flex flex-col gap-3">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index] }} />
              <span className="text-gray-700 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default PieChart;
