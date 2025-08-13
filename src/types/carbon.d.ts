// types/carbon.d.ts
// Add these utility types
type RegionCode = 'us' | 'eu' | 'asia' | 'fr' | 'de' | 'cn' | 'in';
type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 
                'July' | 'August' | 'September' | 'October' | 'November' | 'December';
export type CarbonActivity = {
  id: string;
  activityType: 'ELECTRICITY' | 'WATER' | 'FUEL' | 'WASTE';
  value: number;
  footprint: number;
  region?: string;
  month: string;
  createdAt: string;
};

export type CarbonInput = {
  activityType: 'ELECTRICITY' | 'WATER' | 'FUEL' | 'WASTE';
  value: number;
  region?: string;
  fuelType?: 'gasoline' | 'diesel' | 'naturalGas';
  //fuelType?: 'GASOLINE' | 'DIESEL' | 'NATURAL_GAS'; // ✅ Matches Java enum

  disposalMethod?: 'recycled' | 'landfilled' | 'incinerated';
  unit?: 'LITERS' | 'CUBIC_METERS';
  month?: string;
  year?: string;
};

// ===== NEW TYPES FOR EDIT FUNCTIONALITY =====

// Type for fetching existing data parameters
export interface GetResourceDataParams {
  month: string;
  year: string;
  region: string;
}

// Type for existing resource data response from backend
/*export interface ExistingResourceData {
  id?: string; // Optional ID from backend
  electricity?: number;
  water?: number;
  fuel?: number;
  waste?: number;
  fuelType?: 'gasoline' | 'diesel' | 'naturalGas';
  unit?: 'LITERS' | 'CUBIC_METERS';
  disposalMethod?: 'recycled' | 'landfilled' | 'incinerated';
  region: string;
  month: string;
  year: string;
  companyId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}*/

// Type for update operation parameters
export interface UpdateFootprintParams {
  month: string;
  year: string;
  region: string;
}
// Add these utility types
type RegionCode = 'us' | 'eu' | 'asia' | 'fr' | 'de' | 'cn' | 'in';
type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 
                'July' | 'August' | 'September' | 'October' | 'November' | 'December';

// Enhanced ExistingResourceData interface
export interface ExistingResourceData {
  id?: string;
  electricity?: number | null;
  water?: number | null;
  fuel?: number | null;
  waste?: number | null;
  fuelType?: 'gasoline' | 'diesel' | 'naturalGas' | null;
  unit?: 'LITERS' | 'CUBIC_METERS' | null;
  disposalMethod?: 'recycled' | 'landfilled' | 'incinerated' | null;
  region: string; // Backend may return any case
  month: string; // Backend may return '01' or 'January'
  year: string;
  companyId?: string;
  userId?: string;
}

// Enhanced form data type
export interface ResourceEditFormData {
  electricity: string;
  water: string;
  fuel: string;
  waste: string;
  fuelType: 'gasoline' | 'diesel' | 'naturalGas';
  unit: 'LITERS' | 'CUBIC_METERS';
  disposalMethod: 'recycled' | 'landfilled' | 'incinerated';
  region: RegionCode;
  month: MonthName;
  year: string;
}
// Type for the composite data used in edit forms
/*export interface ResourceEditData {
  electricity: string; // Form inputs are strings
  water: string;
  fuel: string;
  waste: string;
  fuelType: 'gasoline' | 'diesel' | 'naturalGas';
  unit: 'LITERS' | 'CUBIC_METERS';
  disposalMethod: 'recycled' | 'landfilled' | 'incinerated';
  region: 'us' | 'eu' | 'asia' | 'fr' | 'de' | 'cn' | 'in';
  month: 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
  year: string;
}*/


// Type for API response when updating
export interface UpdateFootprintResponse {
  success: boolean;
  message?: string;
  data?: any;
  updatedRecords?: number;
}