// src/components/report/report.tsx

'use client';

import { useEffect, useState } from 'react';
import type { CarbonActivity } from '@/types/report';
import { fetchReportData } from '@/lib/api/report';
import type { CarbonGoal } from '@/types/goalreport';
import { fetchGoalData } from '@/lib/api/goalreport';
import Link from 'next/link';

const ReportTable = () => {
  const [data, setData] = useState<CarbonActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<CarbonGoal[]>([]);
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

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Company ID</th>
            <th className="px-6 py-3">User ID</th>
            <th className="px-6 py-3">Month</th>
            <th className="px-6 py-3">Year</th>
            <th className="px-6 py-3">Activity Type</th>
            <th className="px-6 py-3">Input Value</th>
            <th className="px-6 py-3">Input Unit</th>
            <th className="px-6 py-3">Footprint (kg CO₂)</th>
            <th className="px-6 py-3">Region</th>
            <th className="px-6 py-3">Fuel Type</th>
            <th className="px-6 py-3">Disposal Method</th>
            <th className="px-6 py-3">Submitted At</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          
          {data.map((activity) => {
             console.log("Activity timestamp:", activity.submittedAt);
             console.log("Parsed:", new Date(activity.submittedAt));
             return(
            <tr
              key={activity.id}
              className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
            >
              <td className="px-6 py-4">{activity.companyId}</td>
              <td className="px-6 py-4">{activity.userId}</td>
              <td className="px-6 py-4">{activity.month}</td>
              <td className="px-6 py-4">{activity.year}</td>
              <td className="px-6 py-4">{activity.activityType}</td>
              <td className="px-6 py-4">{activity.value}</td>
              <td className="px-6 py-4">{activity.unit}</td>
              <td className="px-6 py-4">{activity.footprint}</td>
              <td className="px-6 py-4">{activity.region}</td>
              <td className="px-6 py-4">{activity.fuelType || '-'}</td>
              <td className="px-6 py-4">{activity.disposalMethod || '-'}</td>
              <td className="px-6 py-4">{new Date(activity.submittedAt).toLocaleString()}</td>
              <td className="px-6 py-4">
                <Link
                  href={`/edit-report/${activity.id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          );
})}
        </tbody>
      </table>
      <h2 className="mt-8 mb-4 text-lg font-semibold">Carbon Goals</h2>

<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mb-10">
  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
    <tr>
      <th className="px-6 py-3">Company ID</th>
      <th className="px-6 py-3">User ID</th>
      <th className="px-6 py-3">Month</th>
      <th className="px-6 py-3">Year</th>
      <th className="px-6 py-3">Electricity Target</th>
      <th className="px-6 py-3">Fuel Target</th>
      <th className="px-6 py-3">Water Target</th>
      <th className="px-6 py-3">Waste Target</th>
      <th className="px-6 py-3">Electricity Goal Met</th>
      <th className="px-6 py-3">Fuel Goal Met</th>
      <th className="px-6 py-3">Water Goal Met</th>
      <th className="px-6 py-3">Waste Goal Met</th>
      <th className="px-6 py-3">Created At</th>
      <th className="px-6 py-3">Updated At</th>
      <th className="px-6 py-3">Action</th>
    </tr>
  </thead>
  <tbody>
    {goals.map((goal) => (
      <tr
        key={goal.id}
        className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
      >
        <td className="px-6 py-4">{goal.companyId}</td>
        <td className="px-6 py-4">{goal.userId || '-'}</td>
        <td className="px-6 py-4">{goal.month}</td>
        <td className="px-6 py-4">{goal.year}</td>
        <td className="px-6 py-4">{goal.targetElectricity ?? '-'}</td>
        <td className="px-6 py-4">{goal.targetFuel ?? '-'}</td>
        <td className="px-6 py-4">{goal.targetWater ?? '-'}</td>
        <td className="px-6 py-4">{goal.targetWaste ?? '-'}</td>
        <td className="px-6 py-4">{goal.electricityGoalMet ? 'Yes' : 'No'}</td>
        <td className="px-6 py-4">{goal.fuelGoalMet ? 'Yes' : 'No'}</td>
        <td className="px-6 py-4">{goal.waterGoalMet ? 'Yes' : 'No'}</td>
        <td className="px-6 py-4">{goal.wasteGoalMet ? 'Yes' : 'No'}</td>
        <td className="px-6 py-4">{goal.createdAt ? new Date(goal.createdAt).toLocaleString() : '-'}</td>
        <td className="px-6 py-4">{goal.updatedAt ? new Date(goal.updatedAt).toLocaleString() : '-'}</td>
     
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default ReportTable;
