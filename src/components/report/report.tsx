'use client';

import { useEffect, useState } from 'react';
import type { CarbonActivity } from '@/types/report';
import { fetchReportData } from '@/lib/api/report';
import type { CarbonGoal } from '@/types/goalreport';
import { fetchGoalData } from '@/lib/api/goalreport';
import Link from 'next/link';
import { Download } from 'lucide-react';

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
import { Loading } from '@/components/ui/Loading'; // Import the Loading component

const ReportTable = () => {
  const [data, setData] = useState<CarbonActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<CarbonGoal[]>([]);
const [editingResource, setEditingResource] = useState(false); // Add this state
  const [editingGoal, setEditingGoal] = useState(false); // Add this state
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
    setEditingResource(true); 
    const compositeId = `${year}-${month}-${region}`;
    router.push(`/resource/edit/${compositeId}?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&region=${encodeURIComponent(region)}`);
  };

  // Function to handle edit button click for goals (if you have goal editing)
  const handleEditGoal = (goalId: string) => {
    setEditingGoal(true); // ADD THIS LINE
    console.log('Editing goal with ID:', goalId);
    router.push(`/resource/goal/edit/${goalId}`);
  };
  // Add this right after your handleEditGoal function (around line 60)
const downloadActivitiesCSV = (month: string, year: string, region: string) => {
  // Filter activities for the selected month/year/region
  const filteredData = data.filter(activity => 
    activity.month === month && 
    activity.year === year &&
    activity.region === region
  );

  if (filteredData.length === 0) {
    alert('No data found for the selected period');
    return;
  }

  // Create CSV content
  const csvContent = [
    ['Carbon Activities Report'],
    [`Period: ${month}/${year}`],
    [`Region: ${region}`],
    [''],
    ['Company ID', 'User ID', 'Activity Type', 'Input Value', 'Input Unit', 'Footprint (kg CO₂)', 'Fuel Type', 'Disposal Method', 'Submitted At'],
    ...filteredData.map(activity => [
      activity.companyId,
      activity.userId,
      activity.activityType,
      activity.value,
      activity.unit,
      activity.footprint,
      activity.fuelType || '-',
      activity.disposalMethod || '-',
      new Date(activity.submittedAt).toLocaleString()
    ])
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
  link.setAttribute('download', `carbon_activities_${month}_${year}_${region}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
// Add this function after your getActivityIcon function
/*const sortActivitiesByDate = (activities: CarbonActivity[]) => {
  // Create a map of month names to their numeric values
  const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4,
    May: 5, June: 6, July: 7, August: 8,
    September: 9, October: 10, November: 11, December: 12
  };

  return [...activities].sort((a, b) => {
    // First compare years
    if (a.year !== b.year) {
      return parseInt(a.year) - parseInt(b.year);
    }
    // If same year, compare months
    return monthMap[a.month] - monthMap[b.month];
  });
};

// Add this right after your sortActivitiesByDate function
const sortGoalsByDate = (goals: CarbonGoal[]) => {
  const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4,
    May: 5, June: 6, July: 7, August: 8,
    September: 9, October: 10, November: 11, December: 12
  };

  return [...goals].sort((a, b) => {
    // First compare years
    if (a.year !== b.year) {
      return parseInt(a.year) - parseInt(b.year);
    }
    // If same year, compare months
    return monthMap[a.month] - monthMap[b.month];
  });
};*/
// Update your sortActivitiesByDate function:
const sortActivitiesByDate = (activities: CarbonActivity[]) => {
  // Create a map of month names to their numeric values (case-insensitive)
  const monthMap: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
    // Add uppercase versions too
    JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4,
    MAY: 5, JUNE: 6, JULY: 7, AUGUST: 8,
    SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12
  };

  return [...activities].sort((a, b) => {
    // First compare years
    const yearA = parseInt(a.year);
    const yearB = parseInt(b.year);
    
    if (yearA !== yearB) {
      return yearA - yearB; // Ascending order (older years first)
    }
    
    // If same year, compare months (convert to lowercase for consistency)
    const monthA = monthMap[a.month.toLowerCase()] || 0;
    const monthB = monthMap[b.month.toLowerCase()] || 0;
    
    return monthA - monthB; // Ascending order (earlier months first)
  });
};

// Update your sortGoalsByDate function:
const sortGoalsByDate = (goals: CarbonGoal[]) => {
  const monthMap: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
    JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4,
    MAY: 5, JUNE: 6, JULY: 7, AUGUST: 8,
    SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
    // Handle numeric months too (if your goals use "01", "02", etc.)
    "01": 1, "02": 2, "03": 3, "04": 4, "05": 5, "06": 6,
    "07": 7, "08": 8, "09": 9, "10": 10, "11": 11, "12": 12
  };

  return [...goals].sort((a, b) => {
    // First compare years
    const yearA = parseInt(a.year);
    const yearB = parseInt(b.year);
    
    if (yearA !== yearB) {
      return yearA - yearB; // Ascending order
    }
    
    // If same year, compare months (handle both string and numeric months)
    const monthA = monthMap[a.month.toLowerCase()] || monthMap[a.month] || 0;
    const monthB = monthMap[b.month.toLowerCase()] || monthMap[b.month] || 0;
    
    return monthA - monthB; // Ascending order
  });
};
  // Group activities by month-year for the edit button (YOUR ORIGINAL LOGIC)
  const getEditKey = (activity: CarbonActivity) => `${activity.month}-${activity.year}`;
  
  // Create a map to track which combinations we've already shown edit buttons for (YOUR ORIGINAL LOGIC)
  const editButtonsShown = new Set<string>();
  const downloadButtonsShown = new Set<string>();  // Add this line

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
    <div className="max-w-full mx-auto p-4 md:p-8 font-poppins ">
       {/* Show loading overlay when editing */}
      {editingResource && (
        <Loading 
          title="Loading resource data..." 
          message="Preparing your resource information for editing"
        />
      )}
      
      {editingGoal && (
        <Loading 
          title="Loading goal data..." 
          message="Preparing your sustainability goals for editing"
        />
      )}
      
      {/* Header */}
      <div className="text-center mb-8 b bg-transparent">
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

        <div className="bg-white/70 rounded-[28px] p-4 md:p-8 shadow-lg overflow-hidden transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-xl ">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Company ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      User ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Month
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Year</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Activity Type</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Input Value</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Input Unit</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Footprint (kg CO₂)</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Globe2 size={16} />
                      Region
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Fuel Type</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Disposal Method</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Updated At
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortActivitiesByDate(data).map((activity) => {
                  console.log("Activity timestamp:", activity.submittedAt);
                  console.log("Parsed:", new Date(activity.submittedAt));
                  
                  // YOUR ORIGINAL EDIT BUTTON LOGIC
                  const editKey = getEditKey(activity);
                  const downloadKey = `${activity.month}-${activity.year}-${activity.region}`;
                  const showEditButton = !editButtonsShown.has(editKey);
                  const showDownloadButton = !downloadButtonsShown.has(downloadKey);
                  //if (showEditButton) {
                  //  editButtonsShown.add(editKey);
                  //}
                      if (showEditButton) editButtonsShown.add(editKey);

                  if (showDownloadButton) downloadButtonsShown.add(downloadKey);
                  
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
                        {/*original edit button code-commented out
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
                        )}*/}

  <div className="flex gap-2">
    {showEditButton && (
      <button
        onClick={() => handleEditResource(activity.month, activity.year, activity.region)}
        className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-[20px] text-sm font-medium hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <Edit3 size={14} />
        Edit
      </button>
    )}
    {showDownloadButton && (
    <button
      onClick={() => downloadActivitiesCSV(activity.month, activity.year, activity.region)}
      className="inline-flex items-center gap-1 bg-green-900 text-white px-3 py-2 rounded-[20px] text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
      title={`Download ${activity.month} ${activity.year} data`}
    >
      <Download size={14} />
      CSV
    </button>
    )}
    {!showEditButton && !showDownloadButton && (
              <span className="text-gray-400 text-sm">-</span>
            )}
  </div>

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
          <Target className="text-black-600" size={28} />
          Carbon Goals
        </h2>

        <div className="bg-white/70 rounded-[28px] p-4 md:p-8 shadow-lg overflow-hiddentransition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Company ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      User ID
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Month</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Year</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Zap className="text-yellow-600" size={16} />
                      Electricity Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Fuel className="text-red-600" size={16} />
                      Fuel Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Droplet className="text-blue-600" size={16} />
                      Water Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-2">
                      <Trash2 className="text-green-600" size={16} />
                      Waste Target
                    </div>
                  </th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Electricity Goal Met</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Fuel Goal Met</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Water Goal Met</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Waste Goal Met</th>
                  
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Updated At</th>
                  <th className="px-4 py-4 font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortGoalsByDate(goals).map((goal) => (
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
                      {goal.updatedAt ? new Date(goal.updatedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleEditGoal(goal.id.toString())}
                        className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-[20px] text-sm font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
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