import React from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  unit: string;
  icon: LucideIcon;
  value: string;
  onChange: (val: string) => void;
}

const ResourceInputRow: React.FC<Props> = ({ label, unit, icon: Icon, value, onChange }) => (
  <div className="flex flex-col mb-4 md:mb-6">
    <label className="flex items-center font-semibold gap-2 text-lg text-gray-900 mb-2">
      <Icon className="text-green-700 w-6 h-6" />
      {label}
    </label>
    <div className="flex items-center">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="flex-grow rounded-[25px] border-4 border-yellow-50 outline-none p-3 text-lg transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:shadow-md"
      />
      <span className="ml-3 font-semibold text-lg text-gray-900">{unit}</span>
    </div>
  </div>
);

export default ResourceInputRow;
