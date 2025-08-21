"use client";

import type { CarbonInput } from "@/types/carbon";
import { useEffect } from "react";
import React, { useState } from "react";
import { Calendar, Globe2, Zap, Fuel, Droplet, Trash2, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { updateFootprint, getResourceDataForMonth } from '@/lib/api/carbon'; // You'll need to implement these
import { useRouter, useSearchParams } from 'next/navigation';

type ActivityType = "ELECTRICITY" | "WATER" | "WASTE" | "FUEL";
type VolumeUnit = "LITERS" | "CUBIC_METERS";
type DisposalMethod = "recycled" | "landfilled" | "incinerated";
type FuelType = "gasoline" | "diesel" | "naturalGas";
type Region = "us" | "eu" | "asia" | "fr" | "de" | "cn" | "in";
type Month = 
  | "January" | "February" | "March" | "April" | "May" | "June" 
  | "July" | "August" | "September" | "October" | "November" | "December";

type FormData = {
  electricity: string;
  water: string;
  fuel: string;
  waste: string;
  fuelType: FuelType;
  unit: VolumeUnit;
  disposalMethod: DisposalMethod;
  region: Region;
  month: Month;
  year: string; 
};

// Type for the existing data from backend
type ExistingResourceData = {
  electricity?: number;
  water?: number;
  fuel?: number;
  waste?: number;
  fuelType?: FuelType;
  unit?: VolumeUnit;
  disposalMethod?: DisposalMethod;
  region: string;
  month: string; // This will come as month name
  year: string;
};

const ResourceEditForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const monthParam = searchParams.get('month') as Month;
  const yearParam = searchParams.get('year');
  const regionParam = searchParams.get('region') as Region;
  
  const [formData, setFormData] = useState<FormData>({
    electricity: "",
    water: "",
    fuel: "",
    fuelType: "gasoline" as FuelType,
    unit: "LITERS" as VolumeUnit,
    waste: "",
    disposalMethod: "recycled" as DisposalMethod,
    region: regionParam || "us" as Region,
    month: monthParam || "January",
    year: yearParam || new Date().getFullYear().toString(),
  });

  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState<ExistingResourceData | null>(null);

  // Load existing data when component mounts
  useEffect(() => {
    async function loadExistingData() {
      if (!monthParam || !yearParam || !regionParam) {
        console.error("Missing required parameters");
        router.push('/dashboard'); // Redirect if missing params
        return;
      }

      try {
        setIsLoading(true);
        // This function needs to be implemented in your API
        const existingData = await getResourceDataForMonth({
          month: monthParam,
          year: yearParam,
          region: regionParam
        });

        if (existingData) {
          setOriginalData({...existingData,region: (existingData.region.toLowerCase() as Region),month: monthParam });// Convert case
    
          // Populate form with existing data
          setFormData({
            electricity: existingData.electricity?.toString() || "",
            water: existingData.water?.toString() || "",
            fuel: existingData.fuel?.toString() || "",
            waste: existingData.waste?.toString() || "",
            fuelType: existingData.fuelType || "gasoline",
            unit: existingData.unit || "LITERS",
            disposalMethod: existingData.disposalMethod || "recycled",
            region:  (existingData.region.toLowerCase() as Region),
            month:  monthParam, //existingData.month as Month,
            year: existingData.year,
          });
        }
      } catch (error) {
        console.error("Failed to load existing data:", error);
        // You might want to show an error message or redirect
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingData();
  }, [monthParam, yearParam, regionParam, router]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    // Reset to original data or go back
    if (originalData) {
      setFormData({
        electricity: originalData.electricity?.toString() || "",
        water: originalData.water?.toString() || "",
        fuel: originalData.fuel?.toString() || "",
        waste: originalData.waste?.toString() || "",
        fuelType: originalData.fuelType || "gasoline",
        unit: originalData.unit || "LITERS",
        disposalMethod: originalData.disposalMethod || "recycled",
        region: originalData.region.toLowerCase() as Region,
        month: originalData.month as Month,
        year: originalData.year,
      });
    }
  };

  const handleGoBack = () => {
    router.back(); // or router.push('/reports') depending on your routing
  };

  const toggleHelp = () => {
    setShowHelp((prev) => !prev);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const inputs: CarbonInput[] = [];

      if (formData.electricity) {
        inputs.push({
          activityType: "ELECTRICITY",
          value: Number(formData.electricity),
          region: formData.region,
          month: formData.month,
          year: formData.year,
        });
      }

      if (formData.water) {
        inputs.push({
          activityType: "WATER",
          value: Number(formData.water),
          region: formData.region,
          month: formData.month,
          year: formData.year,
        });
      }

      if (formData.fuel) {
        inputs.push({
          activityType: "FUEL",
          value: Number(formData.fuel),
          region: formData.region,
          month: formData.month,
          year: formData.year,
          fuelType: formData.fuelType,
          unit: formData.unit
        });
      }

      if (formData.waste) {
        inputs.push({
          activityType: "WASTE",
          value: Number(formData.waste),
          region: formData.region,
          month: formData.month,
          year: formData.year,
          disposalMethod: formData.disposalMethod
        });
      }

      if (inputs.length === 0) {
        alert("Please enter at least one activity value.");
        return;
      }

      // Use update function instead of create
      const result = await updateFootprint(inputs, {
        
        month: formData.month,
        year: formData.year,
        region: formData.region
      });
      
      console.log("Update result:", result);
      
      // Show success message and redirect
      alert("Data updated successfully!");
      router.push(`/results/${formData.month}/${formData.year}?region=${formData.region}`); // or wherever you want to redirect

    } catch (error) {
      console.error("Update Error:", error);
      alert("Failed to update data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto p-8 font-poppins">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading existing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto p-8 font-poppins">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handleGoBack}
          className="mr-4 bg-gray-600 text-white rounded-full w-10 h-10 font-bold
                     cursor-pointer transition-transform transition-colors duration-200
                     hover:bg-gray-700 hover:scale-110 flex items-center justify-center"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="uppercase text-xl font-bold text-center flex-1 text-gray-900 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
          Edit Resource Usage Data
        </h1>
        
        <button
          onClick={toggleHelp}
          className="ml-4 bg-green-600 text-white rounded-full w-8 h-8 font-bold
                     cursor-pointer transition-transform transition-colors duration-200
                     hover:bg-green-700 hover:scale-110 flex items-center justify-center"
          aria-label="Toggle Help"
        >
          ?
        </button>
      </div>

      {/* Period Info Display */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-black-800">
        <p className="font-semibold text-center">
          Editing data for: <span className="text-black-900">{formData.month} {formData.year}</span> 
          {" "}in <span className="text-black-900">{formData.region.toUpperCase()}</span> region
        </p>
      </div>

      {/* Conditional help panel */}
      {showHelp && (
        <div
          className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 my-4 text-green-800 text-sm
                     shadow-md animate-fadeIn"
          role="region"
          aria-live="polite"
        >
          <p className="font-semibold mb-2 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">What to input:</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>
              <strong>Electricity:</strong> Total kWh consumed monthly (1 kWh = 1000 Wh)
            </li>
            <li>
              <strong>Water:</strong> Total liters used per month
            </li>
            <li>
              <strong>Fuel:</strong> Liters of fuel (e.g. petrol, diesel) consumed monthly
            </li>
            <li>
              <strong>Waste:</strong> Kilograms of solid waste produced monthly
            </li>
          </ul>
          <p className="italic text-green-700 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">
            Tip: Check your utility bills for monthly data.
          </p>
        </div>
      )}

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Electricity */}
        <div
          className="bg-white p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
                     transition-transform transition-shadow duration-300
                     hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer"
        >
          <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
            <Zap className="text-black-700" size={30} />
            Electricity Usage:
          </label>
          <input
            type="number"
            min="0"
            max="3000"
            value={formData.electricity}
            onChange={(e) => handleChange("electricity", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Kwh/month"
          />
        </div>

        {/* Water */}
        <div
          className="bg-white p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
                     transition-transform transition-shadow duration-300
                     hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer"
        >
          <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
            <Droplet className="text-black-700" size={30} />
            Water Consumption:
          </label>
          <input
            type="number"
            min="0"
            max="3000"
            value={formData.water}
            onChange={(e) => handleChange("water", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Litres/month"
          />
        </div>

        {/* Fuel */}
        <div
          className="bg-white p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
                     transition-transform transition-shadow duration-300
                     hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer"
        >
          <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
            <Fuel className="text-black-700" size={30} />
            Fuel Consumption:
          </label>
          <select
            value={formData.fuelType}
            onChange={(e) => handleSelectChange("fuelType", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg mb-2 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
          >
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="naturalGas">Natural Gas</option>
          </select>
          <select
            value={formData.unit || "LITERS"}
            onChange={(e) => handleSelectChange("unit", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg mb-2"
          >
            <option value="LITERS">Liters</option>
            <option value="CUBIC_METERS">Cubic Meters</option>
          </select>
          <input
            type="number"
            min="0"
            max="3000"
            value={formData.fuel}
            onChange={(e) => handleChange("fuel", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Litres or Cubic Meters/month"
          />
        </div>

        {/* Waste */}
        <div
          className="bg-white p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
                     transition-transform transition-shadow duration-300
                     hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer"
        >
          <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
            <Trash2 className="text-black-700" size={30} />
            Waste Produced:
          </label>
          <select
            value={formData.disposalMethod}
            onChange={(e) => handleSelectChange("disposalMethod", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg mb-2 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
          >
            <option value="recycled">Recycled</option>
            <option value="landfilled">Landfilled</option>
            <option value="incinerated">Incineration</option>
          </select>
          <input
            type="number"
            min="0"
            max="3000"
            value={formData.waste}
            onChange={(e) => handleChange("waste", e.target.value)}
            className="rounded-[25px] border-4 border-[#43a243] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Kg/month"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-8">
        <Button
          variant="secondary"
          size="md"
          onClick={handleCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]"
        >
          Reset
        </Button>

        <Button
          variant="primary"
          size="md"
          type="submit"
          isLoading={isSubmitting}
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Data"}
        </Button>
      </div>
    </div>
  );
};

export default ResourceEditForm;