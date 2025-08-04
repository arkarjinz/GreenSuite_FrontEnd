// src/components/report/report.tsx

'use client';

import { useEffect, useState } from 'react';
import type { CarbonActivity } from '@/types/report';
import { fetchReportData } from '@/lib/api/report';
import Link from 'next/link';

const ReportTable = () => {
  const [data, setData] = useState<CarbonActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const activities = await fetchReportData();
        setData(activities);
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
          
          {data.map((activity) => (
            
            <tr
              key={activity.id}
              className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
            >
              <td className="px-6 py-4">{activity.companyId}</td>
              <td className="px-6 py-4">{activity.userId}</td>
              <td className="px-6 py-4">{activity.month}</td>
              <td className="px-6 py-4">{activity.year}</td>
              <td className="px-6 py-4">{activity.activityType}</td>
              <td className="px-6 py-4">{activity.inputValue}</td>
              <td className="px-6 py-4">{activity.inputUnit}</td>
              <td className="px-6 py-4">{activity.footprint}</td>
              <td className="px-6 py-4">{activity.region}</td>
              <td className="px-6 py-4">{activity.fuelType || '-'}</td>
              <td className="px-6 py-4">{activity.disposalMethod || '-'}</td>
              <td className="px-6 py-4">{new Date(activity.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4">
                <Link
                  href={`/edit-report/${activity.id}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
