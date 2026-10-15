"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { Box } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/login");
    }
  }, [router]);

  const navbarHeight = 80;
  const sidebarWidth = 80;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ display: "flex" }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,

            ml: {
              xs: 0,
              sm: `${sidebarWidth}px`,
            },

            mt: {
              xs: "136px",
              md: `${navbarHeight}px`,
            },

            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, md: 3 },

            pb: 4,

            bgcolor: "background.default",
            minHeight: `calc(100vh - ${navbarHeight}px)`,
            overflowY: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}