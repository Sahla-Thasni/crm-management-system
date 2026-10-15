"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Box, Typography, IconButton, useTheme } from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    name: "Leads",
    path: "/leads",
    icon: <GroupsRoundedIcon />,
  },
  {
    name: "Companies",
    path: "/companies",
    icon: <BusinessCenterRoundedIcon />,
  },
  {
    name: "Deals",
    path: "/deals",
    icon: <AssignmentRoundedIcon />,
  },
  {
    name: "Tickets",
    path: "/tickets",
    icon: <ConfirmationNumberRoundedIcon />,
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: mobile ? "100%" : 80,
        height: mobile
          ? "100%"
          : {
              xs: "calc(100vh - 72px)",
              sm: "calc(100vh - 128px)",
              md: "calc(100vh - 72px)",
            },
        position: mobile ? "static" : "fixed",
        top: mobile
          ? 0
          : {
              xs: "72px",
              sm: "136px",
              md: "72px",
            },
        left: 0,

        bgcolor: "background.paper",

        borderRight: mobile ? "none" : `1px solid ${theme.palette.divider}`,

        display: {
          xs: mobile ? "flex" : "none",
          sm: mobile ? "none" : "flex",
        },

        flexDirection: "column",

        alignItems: mobile ? "stretch" : "center",

        py: 2,

        overflowY: "auto",
      }}
    >
      {menu.map((item) => {
        const active = pathname === item.path || 
        pathname.startsWith(`${item.path}/`);
        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => onClose?.()}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: mobile ? "row" : "column",
                alignItems: "center",
                justifyContent: mobile ? "flex-start" : "center",
                gap: mobile ? 2 : 0,
                px: mobile ? 2 : 0,
                py: mobile ? 1.5 : 0,
                mb: mobile ? 1 : 2,

                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              <IconButton
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  bgcolor: active ? "primary.main" : "background.paper",
                  color: active ? "primary.contrastText" : "text.secondary",
                  border: active
                    ? "none"
                    : `1px solid ${theme.palette.divider}`,
                  boxShadow: active ? "0 8px 20px rgba(37,99,235,.25)" : "none",

                  "&:hover": {
                    bgcolor: active ? "primary.dark" : "background.default",
                  },
                }}
              >
                {item.icon}
              </IconButton>

              <Typography
                variant="body2"
                sx={{
                  mt: mobile ? 0 : 0.75,
                  fontSize: mobile ? 14 : 12,
                  fontWeight: active ? 650 : 500,
                  color: "text.primary",
                }}
              >
                {item.name}
              </Typography>
            </Box>
          </Link>
        );
      })}
    </Box>
  );
}
