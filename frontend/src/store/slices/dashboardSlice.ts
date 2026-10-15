import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiRequest } from "@/lib/api";

import type { DashboardData } from "@/types/dashboard";

export type DashboardPeriod = "monthly" | "weekly" | "yearly";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  period: DashboardPeriod;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  period: "monthly",
};

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  DashboardPeriod,
  { rejectValue: string }
>("dashboard/fetchDashboard", async (period, { rejectWithValue }) => {
  try {
    const response = await apiRequest<DashboardData>(
      `/dashboard/?period=${period}`,
    );

    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch dashboard data.",
    );
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    setDashboardPeriod: (
      state,
      action: {
        payload: DashboardPeriod;
      },
    ) => {
      state.period = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch dashboard data.";
      });
  },
});
export const { setDashboardPeriod } = dashboardSlice.actions;

export default dashboardSlice.reducer;
