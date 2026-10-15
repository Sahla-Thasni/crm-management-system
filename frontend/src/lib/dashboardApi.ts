import { apiRequest } from "@/lib/api";

export interface DashboardConversion {
  title: string;
  percentage: number;
}

export interface DashboardSalesReport {
  month: string;
  sales: number;
}

export interface DashboardTeamPerformance {
  id: number;
  employee: string;
  activeDeals: number;
  closedDeals: number;
  revenue: number;
  growth: number;
}

export interface DashboardData {
  total_leads: number;
  active_deals: number;
  closed_deals: number;
  monthly_revenue: number;
  conversion: DashboardConversion[];
  sales_report: DashboardSalesReport[];
  team_performance: DashboardTeamPerformance[];
}

export async function getDashboardData(): Promise<DashboardData> {
  return apiRequest<DashboardData>("/dashboard/");
}