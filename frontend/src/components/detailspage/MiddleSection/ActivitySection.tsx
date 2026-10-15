"use client";

import ActivityTabs from "./ActivityTab";
import { Box, Typography, Button } from "@mui/material";
import ActivityCards from "./ActivityCards";
import SearchActivity from "./ActivitySearch";
import { useMemo, useState } from "react";

import {
  ActivitySectionProps,
  actionConfig,
} from "@/types/detailspage/activity";

export default function ActivitySection({
  activities = [],
  activeTab,
  onTabChange,
  showButton = false,
  buttonText = "Convert",
  onButtonClick,
  onOpenForm,
  onTaskComplete,
  onCallOutcomeChange,
  onCallDurationChange,
}: ActivitySectionProps) {
  const [search, setSearch] = useState("");

  const currentSection = actionConfig[activeTab];

  const filteredItems = useMemo(() => {
    // -----------------------------------------
    // ACTIVITY TAB
    // -----------------------------------------
    if (activeTab === "Activity") {
      const activityItems =
        activities.find(
          (tab) => tab.tab === "Activity"
        )?.items ?? [];

      const otherItems = activities
        .filter(
          (tab) =>
            tab.tab !== "Activity"
        )
        .flatMap((tab) => tab.items ?? []);

      const allItems = [
        ...activityItems,
        ...otherItems,
      ];

      return allItems.filter((item) =>
        JSON.stringify(item)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // -----------------------------------------
    // INDIVIDUAL TAB
    // -----------------------------------------
    const items =
      activities.find(
        (tab) => tab.tab === activeTab
      )?.items ?? [];

    return items.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [activities, activeTab, search]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {/* Search */}
      <SearchActivity
        search={search}
        onSearchChange={setSearch}
        showButton={showButton}
        buttonText={buttonText}
        onButtonClick={onButtonClick}
      />

      {/* Tabs */}
      <ActivityTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Section Header */}
      {currentSection && (
        <Box
          sx={{
            mt: 2,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
            }}
          >
            {currentSection.title}
          </Typography>

          <Button
            variant="contained"
            onClick={() =>
              onOpenForm?.(
                activeTab as
                | "Notes"
                | "Emails"
                | "Calls"
                | "Tasks"
                | "Meetings"
              )
            }
            sx={{
              height: 32,
              px: 2,
              borderRadius: 1,
              textTransform: "none",
              typography: "caption",
              fontWeight: 500,
            }}
          >
            {currentSection.button}
          </Button>
        </Box>
      )}

      {/* Activity Cards */}
      <ActivityCards
        items={filteredItems}
        activeTab={activeTab}
        onTaskComplete={onTaskComplete}
        onCallOutcomeChange={onCallOutcomeChange}
        onCallDurationChange={onCallDurationChange}
      />
    </Box>
  );
}