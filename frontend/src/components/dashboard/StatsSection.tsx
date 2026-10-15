"use client";

import Grid from "@mui/material/Grid";

import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

import { StatsCard } from "@/components/dashboard";

import { dashboardStats } from "@/data/dashboard";

export default function StatsSection() {
  const dashboardData = useSelector(
    (state: RootState) => state.dashboard.data,
  );

  const stats = dashboardStats.map((stat) => {
    switch (stat.title) {
      case "Total Leads":
        return {
          ...stat,
          sales: String(
            dashboardData?.total_leads ?? 0,
          ),
        };

      case "Active Deals":
        return {
          ...stat,
          sales: String(
            dashboardData?.active_deals ?? 0,
          ),
        };

      case "Closed Deals":
        return {
          ...stat,
          sales: String(
            dashboardData?.closed_deals ?? 0,
          ),
        };

      case "Monthly Revenue":
        return {
          ...stat,
          sales: `$${Number(
            dashboardData?.monthly_revenue ?? 0,
          ).toLocaleString()}`,
        };

      default:
        return stat;
    }
  });

  return (
    <Grid
      container
      spacing={{
        xs: 2,
        md: 3,
      }}
    >
      {stats.map((stat) => (
        <Grid
          key={stat.id}
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatsCard stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
}