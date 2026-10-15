"use client";

import { memo } from "react";
import { Card, Box, Typography } from "@mui/material";
import { DashboardStat } from "@/types/dashboard";

interface StatsCardProps {
  stat: DashboardStat;
}

function StatsCard({ stat }: StatsCardProps) {
  const Icon = stat.icon;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        height: 150,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: (theme) =>
          theme.transitions.create(["transform", "box-shadow"], {
          duration: theme.transitions.duration.shorter,
        }),

        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
          
        },
      }}
    >
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {stat.title}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            mt: 2,
            fontWeight: 700,
          }}
        >
          {stat.sales}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          bgcolor: stat.iconBackground,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon
          sx={{
            color: stat.iconColor,
            fontSize: 32,
          }}
        />
      </Box>
    </Card>
  );
}

export default memo(StatsCard);