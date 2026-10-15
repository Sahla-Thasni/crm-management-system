"use client";

import { Box, Card } from "@mui/material";
import {ConversionCard ,  SalesReportCard,} from "@/components/dashboard";

export default function SalesOverviewCard() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        gap: 3, // 24px
        alignItems: "stretch",
        width: "100%"
      }}
    >
      {/* Left Card */}
      <Card
        sx={{
          width: {
            xs: "100%",
            md: 320,
          }, 
          height: "auto",
          minHeight: {
            xs: "auto",
            md: 380,
          },
          
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          borderRadius: 3,
          p: 3,
        }}
      >
        <ConversionCard />
      </Card>

      {/* Right Card */}
      <Card
        sx={{
          flex: 1,
          width: {
            xs: "100%",
            md: "auto",
          },
          height: "auto",
          minHeight: {
            xs:380,
            md: 380,
          },
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          borderRadius: 3,
          p: 3,
        }}
      >
        <SalesReportCard />
      </Card>
    </Box>
  );
}