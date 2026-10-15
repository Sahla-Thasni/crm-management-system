"use client";

import { Box, Typography } from "@mui/material";

import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

import { ConversionProgress } from "@/components/dashboard";

export default function ConversionCard() {
  const conversionData = useSelector(
    (state: RootState) =>
      state.dashboard.data?.conversion ?? [],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Title */}

      <Typography
        sx={{
          fontSize: {
            xs: 16,
            md: 18,
          },
          mb: 3,
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Contact to Deal Conversion
      </Typography>

      {/* Progress List */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {conversionData.map((item, index) => (
          <ConversionProgress
            key={`${item.title}-${index}`}
            title={item.title}
            percentage={item.percentage}
            color={getConversionColor(item.title)}
          />
        ))}
      </Box>
    </Box>
  );
}

// =====================================================
// CONVERSION COLORS
// =====================================================

function getConversionColor(title: string) {
  switch (title) {
    case "Contact":
      return "primary.main";

    case "Qualified Lead":
      return "info.main";

    case "Proposal Sent":
      return "warning.main";

    case "Negotiation":
      return "primary.light";

    case "Closed Won":
      return "success.main";

    case "Closed Lost":
      return "error.main";

    default:
      return "primary.main";
  }
}