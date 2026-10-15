"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TableContainer,
  Paper,
  Typography,
  Box,
} from "@mui/material";

import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

export default function TeamPerformanceTable() {
  const teamPerformance = useSelector(
    (state: RootState) =>
      state.dashboard.data?.team_performance ?? [],
  );

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        overflowX: "auto",
        borderRadius: 2,
      }}
    >
      <Table
        sx={{
          minWidth: 650,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>
              Employee
            </TableCell>

            <TableCell align="center">
              Active Deals
            </TableCell>

            <TableCell align="center">
              Closed Deals
            </TableCell>

            <TableCell align="right">
              Revenue
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {teamPerformance.map((member) => (
            <TableRow
              key={member.id}
              hover
            >
              <TableCell>
                {member.employee}
              </TableCell>

              <TableCell align="center">
                {member.activeDeals}
              </TableCell>

              <TableCell align="center">
                {member.closedDeals}
              </TableCell>

              <TableCell align="right">
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "inherit",
                    }}
                  >
                    $
                    {Number(
                      member.revenue ?? 0,
                    ).toLocaleString()}
                  </Typography>

                  <Chip
                    label={`${
                      member.growth > 0
                        ? "+"
                        : ""
                    }${member.growth}%`}
                    size="small"
                    sx={(theme) => ({
                      ml: 2,
                      fontWeight: 600,

                      backgroundColor:
                        member.growth > 0
                          ? "rgba(34, 197, 94, 0.12)"
                          : "rgba(239, 68, 68, 0.12)",

                      color:
                        member.growth > 0
                          ? theme.palette.success.main
                          : theme.palette.error.main,

                      border: "none",
                    })}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}

          {teamPerformance.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
              >
                No team performance data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}