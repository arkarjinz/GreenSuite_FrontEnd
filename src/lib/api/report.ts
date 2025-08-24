// src/lib/api/report.ts
import axios from 'axios';
import axiosInstance from "@/lib/api/axiosInstance";// this already includes JWT headers

import type { CarbonActivity } from '@/types/report';

export const fetchReportData = async (): Promise<CarbonActivity[]> => {
  const response = await axiosInstance.get('/api/reports?include=user,company'); // You should have this endpoint set up
  return response.data;
};
