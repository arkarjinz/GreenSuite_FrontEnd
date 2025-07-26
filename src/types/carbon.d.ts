// types/carbon.d.ts
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