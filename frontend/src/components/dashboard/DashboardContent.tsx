"use client";

import { useEffect } from "react";
import { exportDashboardCsv } from "@/lib/exportDashboardCsv";

import {
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";

import { fetchDashboard } from "@/store/slices/dashboardSlice";

import {
  StatsSection,
  SalesOverviewCard,
  TeamPerformanceCard,
} from "@/components/dashboard";

export default function DashboardContent() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data,
    loading,
    error,
  } = useSelector(
    (state: RootState) => state.dashboard,
  );

  useEffect(() => {
    dispatch(fetchDashboard("monthly"));
  }, [dispatch]);

  // =================================================
  // LOADING
  // =================================================

  if (loading && !data) {
    return (
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 3,
            lg: 4,
          },
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =================================================
  // DASHBOARD
  // =================================================

  return (
    <Box
      sx={{
        px: {
          xs: 2,
          sm: 3,
          lg: 4,
        },
        py: 2,
      }}
    >
      <StatsSection />

      <Box sx={{ mt: 2 }}>
        <SalesOverviewCard />
      </Box>

      <Box sx={{ mt: 3 }}>
        <TeamPerformanceCard />
      </Box>

      {/* ================================================
          DASHBOARD ERROR SNACKBAR
          ================================================ */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}