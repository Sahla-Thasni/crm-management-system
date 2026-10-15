"use client";

import { Box, LinearProgress, Typography } from "@mui/material";

interface ConversionProgressProps {
  title: string;
  percentage: number;
  color: string;
}

export default function ConversionProgress({
  title,
  percentage,
  color,
}: ConversionProgressProps) {
  return (
    <Box>
      {/* Label */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.8,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {percentage}%
        </Typography>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 7,
          borderRadius: 20,
          backgroundColor: "#EEF2F7",

          "& .MuiLinearProgress-bar": {
            borderRadius: 20,
            backgroundColor: color,
          },
        }}
      />
    </Box>
  );
}
