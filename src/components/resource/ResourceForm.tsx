"use client";

import React, { useState } from "react";
import { Calendar,Globe2,Zap, Fuel, Droplet, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button"; 
import { calculateFootprint } from '@/lib/api/carbon';
// Add these type definitions
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
const ResourceForm: React.FC = () => {
  const [formData, setFormData] = useState({
    electricity: "",
    water: "",
    fuel: "",
    fuelType: "gasoline" as FuelType, // New field
    waste: "",
     disposalMethod: "recycled" as DisposalMethod, // New field
    region: "us" as Region, // Default to United States
    month: new Date().toLocaleString('default', { month: 'long' }) as Month, // Defaults to current month
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
   // New handler for select fields
  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
const handleUndo = () => {
    setFormData({ electricity: "", water: "", fuel: "", fuelType: "gasoline",waste: "",  disposalMethod: "recycled" ,region:"us", month: new Date().toLocaleString('default', { month: 'long' }) as Month,});
  };
  const [showHelp, setShowHelp] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
  const toggleHelp = () => {
    setShowHelp((prev) => !prev);
  };// components/resource/ResourceForm.tsx


const handleSubmit = async () => {
  setIsSubmitting(true);

  try {
    // Determine activity type (simplified example)
    const activityType = formData.electricity ? 'ELECTRICITY' : 
                       formData.water ? 'WATER' :
                       formData.fuel ? 'FUEL' : 'WASTE';

    const result = await calculateFootprint({
      activityType,
      value: Number(formData[activityType.toLowerCase()]),
      region: formData.region,
      month: formData.month,
      ...(activityType === 'FUEL' && { 
        fuelType: formData.fuelType,
        unit: 'LITERS'
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
};

  return (
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
      <div className="mb-6 bg-[#43a243] p-6 rounded-[28px] transition-transform transition-shadow duration-300
             hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
        <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg mb-3 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
          <Globe2 className="text-black-700" size={24} />
          Operational Region
        </label>
        <select
          value={formData.region}
          onChange={(e) => handleSelectChange("region", e.target.value as Region)}
          className="rounded-[25px] border-4 border-[#faf6e9] outline-none px-5 py-3 text-lg w-full shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
        >
          <option value="us">United States (0.82 kg/kWh)</option>
          <option value="eu">European Union (0.28 kg/kWh)</option>
          <option value="fr">France (0.044 kg/kWh)</option>
          <option value="de">Germany (0.37 kg/kWh)</option>
          <option value="cn">China (0.68 kg/kWh)</option>
          <option value="in">India (0.72 kg/kWh)</option>
          <option value="asia">Other Asia (0.72 kg/kWh)</option>
        </select>
        <p className="text-sm mt-2 text-gray-700 drop-shadow-[0_0.8px_0.8px_rgba(0,0,0,0.1)]">
          Selection impacts electricity emission calculations
           </p>
      </div>
      {/* ▲▲▲ REGION SELECTOR ENDS ▲▲▲ */}
      {/* Month Selection */}
<div className="mb-6 bg-[#43a243] p-6 rounded-[28px] transition-transform transition-shadow duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:cursor-pointer">
  <label className="flex items-center font-semibold gap-2 text-gray-900 text-lg mb-3 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)]">
    <Calendar className="text-black-700" size={24} /> {/* Add Calendar to your lucide-react imports */}
    Reporting Month
  </label>
  <select
    value={formData.month}
    onChange={(e) => handleSelectChange("month", e.target.value as Month)}
    className="rounded-[25px] border-4 border-[#faf6e9] outline-none px-5 py-3 text-lg w-full shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.1)]"
  >
    {Array.from({ length: 12 }, (_, i) => {
      const month = new Date(0, i).toLocaleString('default', { month: 'long' });
      return (
        <option key={month} value={month}>
          {month}
        </option>
      );
    })}
  </select>
</div>
      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Electricity */}
        <div
          className="bg-[#43a243] p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
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
            value={formData.electricity}
            onChange={(e) => handleChange("electricity", e.target.value)}
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Kwh/month"
          />
        </div>

        {/* Water */}
        <div
          className="bg-[#43a243] p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
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
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Litres/month"
          />
        </div>

        {/* Fuel */}
        <div
          className="bg-[#43a243] p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
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
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none px-5 py-3 text-lg mb-2 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
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
  className="rounded-[25px] border-4 border-[#faf6e9] outline-none px-5 py-3 text-lg mb-2"
>
  <option value="LITERS">Liters</option>
  <option value="CUBIC_METERS">Cubic Meters</option>
</select>
          <input
            type="number"
            min="0"
            value={formData.fuel}
            onChange={(e) => handleChange("fuel", e.target.value)}
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none
                       px-5 py-3 text-lg
                       transition-transform transition-shadow duration-200
                       hover:scale-[1.03] hover:shadow-md"
            placeholder="Litres/month"
          />
        </div>

        {/* Waste */}
        <div
          className="bg-[#43a243] p-8 rounded-[28px] flex flex-col min-h-[180px] gap-4
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
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none px-5 py-3 text-lg mb-2 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]
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
            className="rounded-[25px] border-4 border-[#faf6e9] outline-none
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
  >
    Submit
  </Button>
</div>
    </div>
  );
};

export default ResourceForm;
