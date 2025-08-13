"use client";
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Lightbulb, Fuel, Droplet, Trash2,Download} from 'lucide-react';
import { getChartData } from '@/lib/api/carbon'; // Import the updated function

const COLORS = ['#fe6600ff', '#0088FE', '#FFBB28', '#ae8051'];
type ChartDataItem = {
  name: string;
  value: number;
  category?: string; // For bar chart data
};

type ChartData = {
  pieData: ChartDataItem[];
  barData: ChartDataItem[];
  totalFootprint: number;
  month: string;
  year: string;
  region: string;
};
const ResultsPage = ({ params }: { params: { month: string, year: string, region: string } }) => {
  const [chartData, setChartData] = useState<ChartData|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Results page params:", params);
        //const response = await fetch(`/api/carbon/chart-data?month=${params.month}&year=${params.year}&region=${params.region}`);
       // const data = await response.json();
       // Call your backend directly instead of the Next.js API route
      const data = await getChartData(params.month, params.year, params.region);
      console.log("Chart data received:", data);
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      //setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.month, params.year, params.region]);
const downloadCSV = () => {
    if (!chartData) return;

    // Create CSV content
    const csvContent = [
      // Header
      ['Carbon Footprint Report'],
      [`Period: ${params.month}/${params.year}`],
      [`Region: ${params.region}`],
      [`Total Footprint: ${chartData.totalFootprint.toFixed(2)} kg CO₂`],
      [''],
      ['Category', 'Emissions (kg CO₂)', 'Percentage'],
      // Data rows
      ...chartData.pieData.map(item => [
        item.name,
        item.value.toFixed(2),
        `${((item.value / chartData.totalFootprint) * 100).toFixed(1)}%`
      ]),
      [''],
      ['Total', chartData.totalFootprint.toFixed(2), '100%']
    ];

    // Convert to CSV string
    const csvString = csvContent
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `carbon_footprint_${params.month}_${params.year}_${params.region}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-tl from-gray-100 to-green-600">Loading...</div>;
  }

  if (!chartData) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-tl from-gray-100 to-green-600">Error loading data</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-tl from-gray-100 to-green-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)] text-center sm:text-left">
            Carbon Footprint Results - {params.month}/{params.year}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              onClick={downloadCSV}
              className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <Download className="mr-2" size={16} />
              Download CSV
            </Button>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            Back to Dashboard
          </Button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#ff944c] p-4 rounded-lg flex items-center">
              <Lightbulb className="text-[#fe6600ff] mr-3" size={24} />
              <div>
                <p className="text-xs sm:text-sm text-gray-600 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">Electricity</p>
                <p className="font-bold text-sm sm:text-base drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)">{chartData.pieData[0].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-[#74beff] p-4 rounded-lg flex items-center">
              <Droplet className="text-blue-500 mr-3" size={24} />
              <div>
                <p className="text-sx sm:text-sm text-gray-600 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">Water</p>
                <p className="font-bold text-sm sm:text-base drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)] truncate">{chartData.pieData[1].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-[#ffcd61] p-4 rounded-lg flex items-center">
              <Fuel className="text-amber-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Fuel</p>
                <p className="font-bold">{chartData.pieData[2].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-[#c19e7b] p-4 rounded-lg flex items-center">
              <Trash2 className="text-brown-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Waste</p>
                <p className="font-bold">{chartData.pieData[3].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-lg transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
            <p className="text-lg font-semibold text-green-800">
              Total Carbon Footprint: <span className="text-2xl">{chartData.totalFootprint.toFixed(2)} kg CO₂</span>
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
            <h2 className="text-xl font-semibold mb-4 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Emission Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }:any) => {
                    const percent = ((value / chartData.totalFootprint) * 100).toFixed(0);
                    return `${name}: ${percent}%`;
  }}
                    //label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    
                    //</PieChart>label={({ name, percent }: { name: string; percent: number }) => 
                   //`${name}: ${(percent * 100).toFixed(0)}%`}
                   // label={function({ name, percent }: { name: string; percent: number }) {
                   // return `${name}: ${(percent * 100).toFixed(0)}%`;
 // }}
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value:number) => [`${value} kg CO₂`, 'Emissions']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
            <h2 className="text-xl font-semibold mb-4 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Emission Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                  <Legend />
                  <Bar dataKey="value" name="Emissions" fill="#8884d8">
                    {chartData.barData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default ResultsPage;