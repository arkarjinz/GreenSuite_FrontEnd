"use client";

import type { CarbonInput } from "@/types/carbon";
import { useEffect } from "react";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Calendar,Globe2,Zap, Fuel, Droplet, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button"; 
import { calculateFootprint } from '@/lib/api/carbon';
import { getSubmittedResourceMonths } from "@/lib/api/carbon";
import { Loading } from '@/components/ui/Loading';
// Add these types to match your Java enums


type ActivityType = "ELECTRICITY" | "WATER" | "WASTE" | "FUEL";

type VolumeUnit = "LITERS" | "CUBIC_METERS"; // Add other units if needed
type DisposalMethod = "recycled" | "landfilled" | "incinerated";
type FuelType = "gasoline" | "diesel" | "naturalGas";
type Region = "us" | "eu" | "asia" | "fr" | "de" | "cn" | "in";
// Add this with your other type definitions
type Month = 
  | "January" | "February" | "March" | "April" | "May" | "June" 
  | "July" | "August" | "September" | "October" | "November" | "December";
// Define the FormData type explicitly
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
//const [submittedMonths, setSubmittedMonths] = React.useState<string[]>([]);

const getNumericMonth = (monthName: string): string => {
  const date = new Date(`${monthName} 1, 2000`);
  const month = date.getMonth() + 1;
  return month.toString().padStart(2, '0'); // e.g., '07'
};
// Helper function to get current year
function getCurrentYear() {
  return new Date().getFullYear();
}
// Define the mapping with proper typing
const activityFieldMap: Record<ActivityType, keyof FormData> = {
  ELECTRICITY: 'electricity',
  WATER: 'water',
  FUEL: 'fuel',
  WASTE: 'waste'
} as const;
  const ResourceForm: React.FC = () => {
    const router = useRouter();
    const currentYear = getCurrentYear();
  const [isRedirecting, setIsRedirecting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
    electricity: "",
    water: "",
    fuel: "",
    fuelType: "gasoline" as FuelType, // New field
     unit: "LITERS" as VolumeUnit, // Add this line
    waste: "",
     disposalMethod: "recycled" as DisposalMethod, // New field
    region: "us" as Region, // Default to United States
    month: new Date().toLocaleString('default', { month: 'long' }) as Month, // Defaults to current month
    //year: new Date().getFullYear().toString(), 
    year: currentYear.toString(),

  });
  
  // Add state for submitted months - similar to goalform.tsx
  const [submittedMonths, setSubmittedMonths] = useState<string[]>([]);
// Fetch submitted months whenever the year changes - similar to goalform.tsx
  
useEffect(() => {
    async function fetchSubmittedResourceMonths() {
      try {
        const months = await getSubmittedResourceMonths(parseInt(formData.year));
        console.log("Submitted resource months for year", formData.year, ":", months);
        setSubmittedMonths(months);
        
        // Auto-select first non-disabled month
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const firstAvailableMonth = monthNames.find(monthName => {
          const numericMonth = getNumericMonth(monthName);
          return !months.includes(numericMonth);
        });
        
        if (firstAvailableMonth) {
          setFormData(prev => ({ ...prev, month: firstAvailableMonth as Month }));
        }
      } catch (err) {
        console.error("Failed to load submitted resource months", err);
        setSubmittedMonths([]);
      }
    }
    fetchSubmittedResourceMonths();
  }, [formData.year]);
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
   // New handler for select fields
  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
const handleUndo = () => {
    setFormData({ electricity: "", water: "", fuel: "", fuelType: "gasoline",waste: "",  disposalMethod: "recycled" ,region:"us", month: new Date().toLocaleString('default', { month: 'long' }) as Month,unit:"LITERS", year: new Date().getFullYear().toString() });
  };
  const [showHelp, setShowHelp] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleHelp = () => {
    setShowHelp((prev) => !prev);
  };// components/resource/ResourceForm.tsx

//start of handlesubmit(old)
//const handleSubmit = async () => {
  //setIsSubmitting(true);

 // try {
    // Determine activity type (simplified example)
   // const activityType = formData.electricity ? 'ELECTRICITY' : 
                      // formData.water ? 'WATER' :
                      // formData.fuel ? 'FUEL' : 'WASTE';
// Type-safe field access
    //const fieldMap = {
     // ELECTRICITY: 'electricity',
     // WATER: 'water',
     // FUEL: 'fuel',
     // WASTE: 'waste'
   // } as const;

   // const fieldName = fieldMap[activityType];
   // const numericValue = Number(formData[fieldName]);
   // const result = await calculateFootprint({
      /*activityType,
       value: numericValue,  // Use the properly typed value
      //value: Number(formData[activityType.toLowerCase()]),
      region: formData.region,
      month: formData.month,
      ...(activityType === 'FUEL' && { 
        fuelType: formData.fuelType,
        unit: formData.unit
      }),
      ...(activityType === 'WASTE' && {
        disposalMethod: formData.disposalMethod
      })
    });

    // Handle success (update UI instead of alert in production)
    console.log('Calculation result:', result);
    
  } catch (error) {
    console.error('API Error:', error);
    // Use your existing error handling
  } finally {
    setIsSubmitting(false);
  }
};//*///end of handlesubmit(old)
const handleSubmit = async () => {
  setIsSubmitting(true);
  setIsRedirecting(true); // Show loading state

  try {
     const numericMonth = getNumericMonth(formData.month); // convert month name to '07' etc.
    const inputs: CarbonInput[] = [];

    if (formData.electricity) {
      inputs.push({
        activityType: "ELECTRICITY",
        value: Number(formData.electricity),
        region: formData.region,
        month: numericMonth,//formData.month,
        year: formData.year,
      });
    }

    if (formData.water) {
      inputs.push({
        activityType: "WATER",
        value: Number(formData.water),
        region: formData.region,
        month: numericMonth,//formData.month,
        year: formData.year,
      });
    }

    if (formData.fuel) {
      inputs.push({
        activityType: "FUEL",
        value: Number(formData.fuel),
        region: formData.region,
        month: numericMonth,//formData.month,
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
        month:numericMonth,// formData.month,
        year: formData.year,
        disposalMethod: formData.disposalMethod
      });
    }

    if (inputs.length === 0) {
      alert("Please enter at least one activity value.");
      return;
    }

    const result = await calculateFootprint(inputs); // Send array of inputs
    console.log("Calculation result:", result);
// Redirect to results page with parameters
    router.push(`/results/${numericMonth}/${formData.year}?region=${formData.region}`);
  } catch (error) {
    console.error("API Error:", error);
  setIsRedirecting(false);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <>
    {isRedirecting && <Loading />}
    <div className="max-w-[900px] mx-auto p-8 font-poppins">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="uppercase text-xl font-bold text-center flex-1 text-gray-900 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
          Enter your resource usage data
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
            <li >
              <strong>Electricity:</strong> Total kWh consumed monthly (1 kWh =
              1000 Wh)
            </li>
            <li>
              <strong>Water:</strong> Total liters used per month
            </li>
            <li>
              <strong>Fuel:</strong> Liters of fuel (e.g. petrol, diesel)
              consumed monthly
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
{/* Region Selection - New */}
      <div className="mb-6 bg-white p-6 rounded-[28px] transition-transform transition-shadow duration-300
             hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
        <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg mb-3 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
          <Globe2 className="text-black-700" size={24} />
          Operational Region
        </label>
        <select
          value={formData.region}
          onChange={(e) => handleSelectChange("region", e.target.value as Region)}
          className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg w-full shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
        >
          <option value="us">United States (0.82 kg/kWh)</option>
          <option value="eu">European Union (0.276 kg/kWh)</option>
          <option value="fr">France (0.044 kg/kWh)</option>
          <option value="de">Germany (0.366kg/kWh)</option>
          <option value="cn">China (0.681 kg/kWh)</option>
          <option value="in">India (0.715 kg/kWh)</option>
          <option value="asia">Other Asia (0.723 kg/kWh)</option>
        </select>
        <p className="text-sm mt-2 text-gray-700 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">
          Selection impacts electricity emission calculations
           </p>
      </div>
      {/* ▲▲▲ REGION SELECTOR ENDS ▲▲▲ */}
      <div className="flex gap-6 mb-6">
      {/*Year Selection*/}
      <div className="flex-1 bg-white p-6 rounded-[28px] transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
  <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg mb-3 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
    <Calendar className="text-black-700" size={24} /> {/* Add Calendar to your lucide-react imports */}
    Reporting Year
  </label>
  <select
    value={formData.year}
    onChange={(e) => handleSelectChange("year", e.target.value)}
    className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg w-full shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
  >
    {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => {
      const yearOption = (2020+i).toString();//(new Date().getFullYear() - 5 + i).toString(); // show 5 years back and 4 years ahead
      return (
        <option key={yearOption} value={yearOption}>
          {yearOption}
        </option>
      );
    })}
  </select>
</div>
      {/* Month Selection */}
<div className="flex-1 bg-white p-6 rounded-[28px] transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
  <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg mb-3 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
    <Calendar className="text-black-700" size={24} /> {/* Add Calendar to your lucide-react imports */}
    Reporting Month
  </label>
  <select
    value={formData.month}
    onChange={(e) => handleSelectChange("month", e.target.value as Month)}
    className="rounded-[25px] border-4 border-[#43a243] outline-none px-5 py-3 text-lg w-full shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
  >
    {Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'long' });
      const numericMonth = getNumericMonth(monthName);
      //const monthValue = String(i + 1).padStart(2, '0'); // "07"
       const isSubmitted = submittedMonths.includes(numericMonth);
      console.log("[DEBUG] Resource Form - Month:", monthName, "Numeric:", numericMonth, "Submitted:", isSubmitted);

       return (
        <option key={monthName} value={monthName}disabled={isSubmitted}
                  title={isSubmitted ? "Resource data already submitted for this month" : ""}
                >
          {monthName}
        </option>
      );
    })}
  </select>
</div>
</div>
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
            max="1000"
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
          {/* Inside your Fuel card */}
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
    onClick={handleUndo} // You can define this function
    className="bg-green-900 hover:bg-green-950 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]"
  >
    Undo
  </Button>

  <Button
    variant="primary"
    size="md"
    type="submit"
    isLoading={isSubmitting}
    onClick={handleSubmit} 
    disabled={isSubmitting}// optional: set to false if not needed
  > {isSubmitting ? "Calculating..." : "Submit"}
    
  </Button>
</div>
    </div>
     </>
  );
};

export default ResourceForm;
