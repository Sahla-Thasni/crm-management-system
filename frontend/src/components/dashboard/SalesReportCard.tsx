"use client";

import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { useDispatch, useSelector } from "react-redux";

import { SalesChart } from "@/components/dashboard";

import {
  fetchDashboard,
  setDashboardPeriod,
  type DashboardPeriod,
} from "@/store/slices/dashboardSlice";

import type {
  RootState,
  AppDispatch,
} from "@/store/store";

export default function SalesReportCard() {
  // =====================================================
  // REDUX
  // =====================================================

  const dispatch = useDispatch<AppDispatch>();

  const period = useSelector(
    (state: RootState) =>
      state.dashboard.period,
  );

  const loading = useSelector(
    (state: RootState) =>
      state.dashboard.loading,
  );

  // =====================================================
  // PERIOD CHANGE
  // =====================================================

  const handlePeriodChange = (
    value: DashboardPeriod,
  ) => {
    dispatch(
      setDashboardPeriod(value),
    );

    dispatch(
      fetchDashboard(value),
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          justifyContent: "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
          }}
        >
          Sales Reports
        </Typography>

        {/* =================================================
            PERIOD SELECT
        ================================================= */}

        <FormControl
          size="small"
          sx={{
            minWidth: {
              xs: "100%",
              sm: 120,
            },
          }}
        >
          <Select
            value={period}
            disabled={loading}
            onChange={(event) =>
              handlePeriodChange(
                event.target.value as DashboardPeriod,
              )
            }
            IconComponent={
              KeyboardArrowDownRoundedIcon
            }
            sx={{
              height: 36,

              fontSize: 13,

              borderRadius: 2,

              bgcolor: "background.paper",

              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
            }}
          >
            <MenuItem value="monthly">
              Monthly
            </MenuItem>

            <MenuItem value="weekly">
              Weekly
            </MenuItem>

            <MenuItem value="yearly">
              Yearly
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* =================================================
          CHART
      ================================================= */}

      <Box
        sx={{
          position: "relative",

          flex: 1,

          height: {
            xs: 260,
            sm: 300,
            md: "100%",
          },

          minHeight: 0,
        }}
      >
        {/* =================================================
            LOADING SPINNER
        ================================================= */}

        {loading && (
          <Box
            sx={{
              position: "absolute",

              inset: 0,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              zIndex: 2,

              bgcolor: "rgba(255, 255, 255, 0.6)",
            }}
          >
            <CircularProgress
              size={32}
            />
          </Box>
        )}

        {/* =================================================
            CHART
        ================================================= */}

        <SalesChart />
      </Box>
    </Box>
  );
}