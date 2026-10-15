"use client";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

import { TeamPerformanceTable } from "@/components/dashboard";

import { exportDashboardCsv } from "@/lib/exportDashboardCsv";

export default function TeamPerformanceCard() {
  const { data } = useSelector(
    (state: RootState) => state.dashboard,
  );

  const handleExportCsv = () => {
    if (!data) {
      return;
    }

    exportDashboardCsv(data);
  };

  return (
    <Card>
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 3,
          },

          "&:last-child": {
            pb: {
              xs: 2,
              md: 3,
            },
          },
        }}
      >
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
          <Typography variant="h5">
            Team Performance Tracking
          </Typography>

          <Button
            variant="outlined"
            onClick={handleExportCsv}
            disabled={!data}
            sx={{
              alignSelf: {
                xs: "stretch",
                sm: "auto",
              },
            }}
          >
            Export CSV
          </Button>
        </Box>

        <TeamPerformanceTable />
      </CardContent>
    </Card>
  );
}