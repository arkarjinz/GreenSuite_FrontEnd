"use client";
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Lightbulb, Fuel, Droplet, Trash2 } from 'lucide-react';
import { getChartData } from '@/lib/api/carbon'; // Import the updated function

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!chartData) {
    return <div className="flex justify-center items-center h-screen">Error loading data</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carbon Footprint Results - {params.month}/{params.year}
          </h1>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 hover:bg-green-700"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <Lightbulb className="text-blue-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Electricity</p>
                <p className="font-bold">{chartData.pieData[0].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg flex items-center">
              <Droplet className="text-teal-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Water</p>
                <p className="font-bold">{chartData.pieData[1].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg flex items-center">
              <Fuel className="text-amber-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Fuel</p>
                <p className="font-bold">{chartData.pieData[2].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg flex items-center">
              <Trash2 className="text-orange-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Waste</p>
                <p className="font-bold">{chartData.pieData[3].value.toFixed(2)} kg CO₂</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-800">
              Total Carbon Footprint: <span className="text-2xl">{chartData.totalFootprint.toFixed(2)} kg CO₂</span>
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Emission Distribution</h2>
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Emission Comparison</h2>
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