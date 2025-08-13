"use client";

import ResourceEditForm from "@/components/resource/ResourceEditForm";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EditResourceContent() {
  const { id } = useParams(); // dynamic id from URL
  const searchParams = useSearchParams();
  
  // Extract month, year, region from either the ID or search params
  // If your ID is formatted like "2024-July-us", you can parse it
  // Otherwise, rely on search params
  
  const monthFromParams = searchParams.get('month');
  const yearFromParams = searchParams.get('year');
  const regionFromParams = searchParams.get('region');
  
  // Parse the ID if it contains the data (optional approach)
  let parsedMonth, parsedYear, parsedRegion;
  if (id && typeof id === 'string') {
    const parts = id.split('-');
    if (parts.length === 3) {
      [parsedYear, parsedMonth, parsedRegion] = parts;
    }
  }
  
  // Use search params first, then fall back to parsed ID
  const month = monthFromParams || parsedMonth;
  const year = yearFromParams || parsedYear;
  const region = regionFromParams || parsedRegion;
  
  // Validate we have the required parameters
  if (!month || !year || !region) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-[900px] mx-auto p-8 font-poppins">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 text-lg font-semibold mb-2">Invalid Edit Request</div>
              <div className="text-gray-600">
                Missing required parameters: month, year, or region
              </div>
              <div className="text-sm text-gray-500 mt-2">
                ID: {id} | Month: {month} | Year: {year} | Region: {region}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <ResourceEditForm />
    </div>
  );
}

export default function EditResourcePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-[900px] mx-auto p-8 font-poppins">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <div className="ml-4 text-lg text-gray-600">Loading edit form...</div>
          </div>
        </div>
      </div>
    }>
      <EditResourceContent />
    </Suspense>
  );
}