import { SvgIconComponent } from "@mui/icons-material";

export interface DashboardStat {
  id: number;
  title: string;
  sales: string;
  icon: SvgIconComponent;
  iconColor: string;
  iconBackground: string;
}

export interface ConversionStat {
  id: number;
  title: string;
  percentage: number;
  color: string;
}

export interface SalesChartData {
  month: string;
  sales: number;   // Actual sales(value)
  target: number;   // Target sales(remaining)
}

export interface TeamPerformance {
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

  conversion: ConversionStat[];

  sales_report: SalesChartData[];

  team_performance: TeamPerformance[];
}