"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

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

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({
  open,
  onClose,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
       sx={{
    display: {
      xs: "block",
      sm: "none",
    },
  }}

slotProps={{
  paper: {
    sx: {
      width: 260,
      boxSizing: "border-box",
      borderTop: "none",

      mt: {
        xs: "128px",
        md: "72px",
      },
      height: {
        xs: "calc(100% - 136px)",
        md: "calc(100% - 72px)",
      },
    },
  },
}}
    >
      <Box>
        <List>
          {menu.map((item) => {
            const active = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
                onClick={onClose}
              >
                <ListItemButton
                  selected={active}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active
                        ? "primary.main"
                        : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText primary={item.name} />
                </ListItemButton>
              </Link>
            );
          })}
        </List>

        <Divider />
      </Box>
    </Drawer>
  );
}