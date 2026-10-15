"use client";

import { Chip, useTheme } from "@mui/material";

export default function StatusChip({
  status,
}: {
  status: string;
}) {
  const theme = useTheme();

  const styles: Record<
    string,
    {
      color: string;
      bgcolor: string;
    }
  > = {
    // Leads
    Converted: {
      color: theme.palette.success.main,
      bgcolor: `${theme.palette.success.main}20`,
    },

    New: {
      color: theme.palette.info.main,
      bgcolor: `${theme.palette.info.main}20`,
    },

    Qualified: {
      color: theme.palette.primary.dark,
      bgcolor: `${theme.palette.primary.main}20`,
    },

    Contacted: {
      color: theme.palette.warning.main,
      bgcolor: `${theme.palette.warning.main}20`,
    },

    // Priority
    High: {
      color: theme.palette.error.main,
      bgcolor: `${theme.palette.error.main}20`,
    },

    Medium: {
      color: theme.palette.warning.main,
      bgcolor: `${theme.palette.warning.main}20`,
    },

    Low: {
      color: theme.palette.success.main,
      bgcolor: `${theme.palette.success.main}20`,
    },

    // Deal stages
    "Proposal Sent": {
      color: theme.palette.info.main,
      bgcolor: `${theme.palette.info.main}20`,
    },

    Negotiation: {
      color: theme.palette.warning.main,
      bgcolor: `${theme.palette.warning.main}20`,
    },

    "Closed Won": {
      color: theme.palette.success.main,
      bgcolor: `${theme.palette.success.main}20`,
    },

    "Closed Lost": {
      color: theme.palette.error.main,
      bgcolor: `${theme.palette.error.main}20`,
    },
  };

  const style = styles[status];

  return (
    <Chip
      label={status || "-"}
      size="small"
      sx={{
        fontWeight: 500,
        px: 1,

        color:
          style?.color ??
          theme.palette.text.primary,

        bgcolor:
          style?.bgcolor ??
          `${theme.palette.grey[500]}20`,

        border: "none",
      }}
    />
  );
}