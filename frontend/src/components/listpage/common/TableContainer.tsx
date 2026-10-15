"use client";

import {
  Paper,
  TableContainer as MuiTableContainer,
} from "@mui/material";

export default function TableContainer({
  children,
  sx,
}: any) {
  return (
    <Paper
      sx={{
        borderRadius: 0,
        border: "2px solid",
        borderColor: "divider",
        overflow: "hidden",
        ...sx,
      }}
    >
      <MuiTableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        {children}
      </MuiTableContainer>
    </Paper>
  );
}