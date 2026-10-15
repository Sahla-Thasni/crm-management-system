"use client";
import { Box, Stack, Typography } from "@mui/material";

import ActivityAccordion from "./ActivityAccordion";
import { ActivityItem } from "@/types/detailspage/activity";
interface CardsProps {
  items: ActivityItem[];
  activeTab: string;

  onTaskComplete?: (
    taskId: number,
    completed: boolean
  ) => Promise<void>;

  onCallOutcomeChange?: (
    callId: number,
    outcome: string
  ) => Promise<void>;

  onCallDurationChange?: (
    callId: number,
    duration: number
  ) => void;

}

export default function ActivityCards({ items, activeTab, onTaskComplete, onCallOutcomeChange, onCallDurationChange }: CardsProps) {
  const formatDate = (date?: string) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getActivityDate = (item: ActivityItem) => {
    return (
      item.dueDate ??
      item.meetingDate ??
      item.date ??
      item.createdAt
    );
  };

  const isUpcoming = (date?: string) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);

    return activityDate >= today;
  };

  const monthYear = (date?: string) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-GB", {
      month: "long",
      year: "numeric",
    });
  };
  const sortedItems = [...items].sort((a, b) => {
    const aDate = getActivityDate(a);
    const bDate = getActivityDate(b);

    const aUpcoming = isUpcoming(aDate);
    const bUpcoming = isUpcoming(bDate);

    // Upcoming first
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    // Then newest to oldest
    return new Date(bDate ?? "").getTime() - new Date(aDate ?? "").getTime();
  });

  return (
    <Stack spacing={2}>
      {sortedItems.map((item, index) => {
        // const expanded = expandedId === item.id;

        const activityDate = getActivityDate(item);
        const isOverdue = Boolean(
          item.type === "Task" &&
          !item.completed &&
          item.dueDate &&
          new Date(item.dueDate) < new Date(),
        );
        const currentHeading = isUpcoming(activityDate)
          ? "Upcoming"
          : monthYear(activityDate);

        const previousHeading =
          index > 0
            ? isUpcoming(getActivityDate(sortedItems[index - 1]))
              ? "Upcoming"
              : monthYear(getActivityDate(sortedItems[index - 1]))
            : "";
        return (
          <Box key={`${item.type}-${item.id}`}>
            {/* Heading */}

            {currentHeading !== previousHeading && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mt: 0.5,
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {currentHeading}
              </Typography>
            )}

            <ActivityAccordion
              item={{
                ...item,
                isOverdue,
              }}
              formatDate={formatDate}
              variant={activeTab === "Emails" ? "email" : "activity"}
              onTaskComplete={onTaskComplete}
              onCallOutcomeChange={onCallOutcomeChange}
              onCallDurationChange={onCallDurationChange}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
