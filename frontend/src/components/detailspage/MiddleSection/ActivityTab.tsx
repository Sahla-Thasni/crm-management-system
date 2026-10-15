"use client";

import { ActivityTabsProps } from "@/types/detailspage/activity";
import { Tabs, Tab } from "@mui/material";


export default function ActivityTabs({
  tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"],
  activeTab,
  onTabChange,
}: ActivityTabsProps) {

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onTabChange?.(newValue);
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        borderBottom: 1,
        borderColor: "divider",

        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px 3px 0 0",
          bgcolor: "primary.main",
        },

        "& .MuiTab-root": {
          textTransform: "none",
          minWidth: "fit-content",
          px: 2,
          py: 1.5,
          mr: 1,
          color: "text.secondary",
          fontWeight: 400,
          fontSize: 14,
        },

        "& .Mui-selected": {
          color: "text.primary",
          fontWeight: 600,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab} value={tab} label={tab} disableRipple />
      ))}
    </Tabs>
  );
}
