'use client';

import { useEffect, useState } from 'react';
import type { CarbonActivity } from '@/types/report';
import { fetchReportData } from '@/lib/api/report';
import type { CarbonGoal } from '@/types/goalreport';
import { fetchGoalData } from '@/lib/api/goalreport';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Edit3, 
  Edit, 
  Calendar, 
  Globe2, 
  Zap, 
  Fuel, 
  Droplet, 
  Trash2,
  Building,
  User,
  Clock,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ReportTable = () => {
  const [data, setData] = useState<CarbonActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<CarbonGoal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const activities = await fetchReportData();
        const goalsData = await fetchGoalData();
        setData(activities);
        setGoals(goalsData);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to handle edit button click for resource data
  const handleEditResource = (month: string, year: string,region: string) => {
    const compositeId = `${year}-${month}-${region}`;
    router.push(`/resource/edit/${compositeId}?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&region=${encodeURIComponent(region)}`);
  };

  // Function to handle edit button click for goals (if you have goal editing)
  const handleEditGoal = (goalId: string) => {
    console.log('Editing goal with ID:', goalId);
    router.push(`/resource/goal/edit/${goalId}`);
  };

  // Group activities by month-year for the edit button (YOUR ORIGINAL LOGIC)
  const getEditKey = (activity: CarbonActivity) => `${activity.month}-${activity.year}`;
  
  // Create a map to track which combinations we've already shown edit buttons for (YOUR ORIGINAL LOGIC)
  const editButtonsShown = new Set<string>();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ELECTRICITY': return <Zap className="text-yellow-600" size={16} />;
      case 'WATER': return <Droplet className="text-blue-600" size={16} />;
      case 'FUEL': return <Fuel className="text-red-600" size={16} />;
      case 'WASTE': return <Trash2 className="text-green-600" size={16} />;
      default: return <Calendar className="text-gray-600" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-poppins">Loading your carbon footprint data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4 md:p-8 font-poppins bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)] mb-2 uppercase">
          Carbon Footprint Report
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Track your environmental impact and sustainability goals
        </p>
      </div>

      {/* Resource Usage Activities Table */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="text-green-600" size={28} />
          Resource Usage Activities
        </h2>

        <div className="bg-white rounded-[28px] p-4 md:p-8 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Company ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      User ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Month
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">Year</th>
                  <th className="px-4 py-4 font-semibold">Activity Type</th>
                  <th className="px-4 py-4 font-semibold">Input Value</th>
                  <th className="px-4 py-4 font-semibold">Input Unit</th>
                  <th className="px-4 py-4 font-semibold">Footprint (kg CO₂)</th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Globe2 size={16} />
                      Region
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">Fuel Type</th>
                  <th className="px-4 py-4 font-semibold">Disposal Method</th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Submitted At
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((activity) => {
                  console.log("Activity timestamp:", activity.submittedAt);
                  console.log("Parsed:", new Date(activity.submittedAt));
                  
                  // YOUR ORIGINAL EDIT BUTTON LOGIC
                  const editKey = getEditKey(activity);
                  const showEditButton = !editButtonsShown.has(editKey);
                  if (showEditButton) {
                    editButtonsShown.add(editKey);
                  }
                  
                  return (
                    <tr
                      key={activity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">{activity.companyId}</td>
                      <td className="px-4 py-4">{activity.userId}</td>
                      <td className="px-4 py-4 font-medium">{activity.month}</td>
                      <td className="px-4 py-4 font-medium">{activity.year}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity.activityType)}
                          <span className="font-medium">{activity.activityType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-green-700">{activity.value}</td>
                      <td className="px-4 py-4">{activity.unit}</td>
                      <td className="px-4 py-4 font-bold text-green-600">{activity.footprint}</td>
                      <td className="px-4 py-4 uppercase text-xs font-medium bg-gray-100 rounded-full px-2 py-1 inline-block">
                        {activity.region}
                      </td>
                      <td className="px-4 py-4">{activity.fuelType || '-'}</td>
                      <td className="px-4 py-4">{activity.disposalMethod || '-'}</td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        {new Date(activity.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        {showEditButton ? (
                          <button
                            onClick={() => handleEditResource(activity.month, activity.year, activity.region)}
                            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-[20px] text-sm font-medium hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Carbon Goals Table */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="text-purple-600" size={28} />
          Carbon Goals
        </h2>

        <div className="bg-white rounded-[28px] p-4 md:p-8 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Company ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      User ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">Month</th>
                  <th className="px-4 py-4 font-semibold">Year</th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Zap className="text-yellow-600" size={16} />
                      Electricity Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Fuel className="text-red-600" size={16} />
                      Fuel Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Droplet className="text-blue-600" size={16} />
                      Water Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Trash2 className="text-green-600" size={16} />
                      Waste Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold">Electricity Goal Met</th>
                  <th className="px-4 py-4 font-semibold">Fuel Goal Met</th>
                  <th className="px-4 py-4 font-semibold">Water Goal Met</th>
                  <th className="px-4 py-4 font-semibold">Waste Goal Met</th>
                  <th className="px-4 py-4 font-semibold">Created At</th>
                  <th className="px-4 py-4 font-semibold">Updated At</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => (
                  <tr
                    key={goal.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">{goal.companyId}</td>
                    <td className="px-4 py-4">{goal.userId || '-'}</td>
                    <td className="px-4 py-4 font-medium">{goal.month}</td>
                    <td className="px-4 py-4 font-medium">{goal.year}</td>
                    <td className="px-4 py-4 font-medium text-yellow-700">{goal.targetElectricity ?? '-'}</td>
                    <td className="px-4 py-4 font-medium text-red-700">{goal.targetFuel ?? '-'}</td>
                    <td className="px-4 py-4 font-medium text-blue-700">{goal.targetWater ?? '-'}</td>
                    <td className="px-4 py-4 font-medium text-green-700">{goal.targetWaste ?? '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {goal.electricityGoalMet ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                        <span className={goal.electricityGoalMet ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {goal.electricityGoalMet ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {goal.fuelGoalMet ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                        <span className={goal.fuelGoalMet ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {goal.fuelGoalMet ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {goal.waterGoalMet ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                        <span className={goal.waterGoalMet ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {goal.waterGoalMet ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {goal.wasteGoalMet ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-red-600" size={16} />
                        )}
                        <span className={goal.wasteGoalMet ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {goal.wasteGoalMet ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {goal.createdAt ? new Date(goal.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {goal.updatedAt ? new Date(goal.updatedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleEditGoal(goal.id.toString())}
                        className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-[20px] text-sm font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <Edit size={14} />
                        Edit Goal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;