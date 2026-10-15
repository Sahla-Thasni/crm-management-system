"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      month?: string;
      sales?: number;
    };
  }>;
  label?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 2,
        py: 1,
        boxShadow: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
        }}
      >
        Sales : {payload[0].value}
      </Typography>
    </Box>
  );
}

export default function SalesChart() {
  const theme = useTheme();

  const salesReport = useSelector(
    (state: RootState) =>
      state.dashboard.data?.sales_report ?? [],
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: {
          xs: 260,
          md: "100%",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={salesReport}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient
              id="purpleGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#7C6CFB"
              />

              <stop
                offset="100%"
                stopColor="#5A46E8"
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              fill: theme.palette.text.secondary,
            }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            width={50}
            domain={[0, "dataMax"]}
            tickCount={5}
            padding={{
              bottom: 10,
            }}
            tickFormatter={(value) =>
              `$${value}`
            }
            tick={{
              fontSize: 12,
              fill: theme.palette.text.secondary,
            }}
          />

          <Tooltip
            cursor={false}
            content={<CustomTooltip />}
          />

          <Bar
            dataKey="sales"
            fill="url(#purpleGradient)"
            radius={[8, 8, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}