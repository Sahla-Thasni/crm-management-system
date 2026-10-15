"use client";

import { ActivityItem } from "@/types/detailspage/activity";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React from "react";
import { useState } from "react";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";

interface Props {
  item: ActivityItem;

  formatDate: (date?: string) => string;

  variant?: "activity" | "email";

  onTaskComplete?: (taskId: number, completed: boolean) => Promise<void>;

  onCallOutcomeChange?: (callId: number, outcome: string) => Promise<void>;

  onCallDurationChange?: (callId: number, duration: number) => void;
}

export default function ActivityAccordion({
  item,
  formatDate,
  onTaskComplete,
  onCallOutcomeChange,
  onCallDurationChange,
  variant = "activity",
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(
    item.type === "Task" ? Boolean(item.completed) : false,
  );

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    const formattedDate = `${day}/${month}/${year}`;

    if (!time) {
      return formattedDate;
    }

    const [hours, minutes] = time.split(":");

    const hour = Number(hours);
    const displayHour = hour % 12 || 12;
    const period = hour >= 12 ? "PM" : "AM";

    return `${formattedDate} ${displayHour}:${minutes} ${period}`;
  };

  // Common Summary Data

  let summary = {
    type: item.type,
    heading: "",
    subtitle: "",
    status: "",
    date: "",
  };

  let showTaskCircle = false;
  let showSubtitle = true;
  let collapsedSubtitle = "";
  let expandedSubtitle = "";
  let details: React.ReactNode = null;

  switch (item.type) {
    // Meeting

    case "Meeting": {
      const meetingDate = item.meetingDate ?? item.date ?? "";
      const meetingTime = item.startTime ?? "";
      const meetingEndTime = item.endTime ?? "";

      const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) {
          return "-";
        }

        const [startHour, startMinute] = start.split(":").map(Number);

        const [endHour, endMinute] = end.split(":").map(Number);

        const startTotal = startHour * 60 + startMinute;

        const endTotal = endHour * 60 + endMinute;

        const difference = endTotal - startTotal;

        if (difference <= 0) {
          return "-";
        }

        const hours = Math.floor(difference / 60);
        const minutes = difference % 60;

        if (hours && minutes) {
          return `${hours} hr ${minutes} min`;
        }

        if (hours) {
          return `${hours} hr`;
        }

        return `${minutes} min`;
      };
      // Lead name
      const leadName = item.lead
        ? `${item.lead.first_name ?? ""} ${item.lead.last_name ?? ""}`.trim()
        : "";

      // Attendee names
      // Lead + all attendee names
      const meetingPeople = [
        leadName,

        ...(item.attendees ?? []).map(
          (attendee) =>
            `${attendee.first_name ?? ""} ${attendee.last_name ?? ""}`.trim() ||
            attendee.email,
        ),
      ].filter(Boolean);

      const meetingHeading = meetingPeople.join(" , ");
      // Organizer
      const organizer = item.createdBy
        ? `${item.createdBy.first_name ?? ""} ${
            item.createdBy.last_name ?? ""
          }`.trim() || item.createdBy.email
        : "";

      // Meeting note
      const description = item.description ?? item.note ?? item.subtitle ?? "";

      const attendeeCount = item.attendees?.length ?? 0;

      summary = {
        type: "Meeting",

        heading: meetingHeading || item.title || "Meeting",

        subtitle: item.title ?? "",

        status: "",

        date: formatDateTime(meetingDate, meetingTime),
      };

      expandedSubtitle = organizer
        ? `Organized by ${organizer}`
        : "Organized by";

      details = (
        <Box>
          {/* Expanded subtitle */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 4,
              mt: 2,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 2,
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Date & Time
              </Typography>

              <Typography variant="body2">
                {formatDateTime(meetingDate, meetingTime)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Duration
              </Typography>

              <Typography variant="body2">
                {calculateDuration(meetingTime, meetingEndTime)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Attendees
              </Typography>

              <Typography variant="body2">{attendeeCount}</Typography>
            </Box>
          </Box>

          {/* NOTE AT BOTTOM */}
          {description && (
            <Box
              sx={{
                mt: 2,
                color: "text.primary",
                "& p": {
                  margin: 0,
                },
              }}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
          )}
        </Box>
      );

      break;
    }

    // Task

    case "Task":
      summary = {
        type: item.type,
        heading: `assigned to ${item.assignedTo}`,
        subtitle: item.title ?? "",
        status: completed ? "Completed" : item.isOverdue ? "Overdue" : "",
        date: formatDateTime(item.dueDate, item.dueTime),
      };

      showTaskCircle = true;
      showSubtitle = !expanded;

      details = (
        <>
          {/* Task title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setCompleted(!completed);
              }}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {completed ? (
                <CheckCircleIcon
                  sx={{
                    fontSize: 20,
                    color: "success.main",
                  }}
                />
              ) : (
                <RadioButtonUncheckedIcon
                  sx={{
                    fontSize: 20,
                    color: "text.secondary",
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {item.title}
            </Typography>
          </Box>

          {/* Task information */}
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 2,
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              columnGap: 6,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Due Date & Time
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                }}
              >
                {formatDateTime(item.dueDate, item.dueTime)}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Priority
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                }}
              >
                {item.priority}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Type
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                }}
              >
                {item.taskType}
              </Typography>
            </Box>
          </Box>

          {/* Note without HTML tags */}
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{
              __html: item.preview ?? "",
            }}
          />
        </>
      );

      break;

    // Call

    case "Call": {
      const callOutcome = item.callOutcome ?? null;
      const callDuration = item.phone_call_duration ?? null;

      // Convert outcome to display text
      let callOutcomeLabel = "-";

      switch (callOutcome) {
        case "connected":
          callOutcomeLabel = "Connected";
          break;

        case "no_answer":
          callOutcomeLabel = "No Answer";
          break;

        case "busy":
          callOutcomeLabel = "Busy";
          break;

        case "voicemail":
          callOutcomeLabel = "Voicemail";
          break;

        case "follow_up":
          callOutcomeLabel = "Follow Up";
          break;
      }

      // Convert duration from seconds to readable text
      let callDurationLabel = "-";

      if (
        callDuration !== null &&
        callDuration !== undefined &&
        !Number.isNaN(Number(callDuration))
      ) {
        const totalSeconds = Math.floor(Number(callDuration));

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
          callDurationLabel = `${minutes} min ${seconds} sec`;
        } else {
          callDurationLabel = `${seconds} second${seconds === 1 ? "" : "s"}`;
        }
      }

      summary = {
        type: "Call",
        heading: ` from ${item.from ?? "Admin"}`,
        subtitle: item.preview ?? item.description ?? "",
        status: "",
        date: formatDateTime(item.date, item.time),
      };

      details = (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            mt: 2,
            px: 1,
          }}
        >
          {/* Outcome */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
              }}
            >
              Outcome
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              {callOutcomeLabel}
            </Typography>
          </Box>

          {/* Duration */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
              }}
            >
              Duration
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              {callDurationLabel}
            </Typography>
          </Box>
        </Box>
      );

      break;
    }

    // Email

    case "Email":
      // in activity timeline
      if (variant === "activity") {
        summary = {
          type: `Logged Email - ${item.heading}`,
          heading: ` by ${item.from}`,
          subtitle: "",
          status: "",
          date: formatDate(item.date),
        };

        collapsedSubtitle = `To ${item.to ?? ""}`;

        expandedSubtitle = `To ${item.to ?? ""}`;
        details = (
          <Box sx={{ mt: 1 }}>
            {/* Email Body */}
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                whiteSpace: "pre-line",
                lineHeight: 2,
                display: "block",
              }}
            >
              {item.subtitle}
            </Typography>

            {/* Attachments */}
            {(item.attachments?.length ?? 0) > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Attachments
                </Typography>

                {item.attachments?.map((attachment) => (
                  <Box
                    key={attachment.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        window.open(attachment.file, "_blank");
                      }}
                    >
                      {attachment.file_name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      }

      // in email

      if (variant === "email") {
        summary = {
          type: `Logged Email - ${item.heading}`,
          heading: ` by ${item.from}`,
          subtitle: "",
          status: item.status ?? "",
          date: formatDate(item.date),
        };

        collapsedSubtitle = `To ${item.to ?? ""}`;

        expandedSubtitle = `To ${item.to ?? ""}`;
        details = (
          <Box sx={{ mt: 1 }}>
            {/* Email Body */}
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                whiteSpace: "pre-line",
                lineHeight: 2,
                display: "block",
              }}
            >
              {item.subtitle}
            </Typography>

            {/* Attachments */}
            {(item.attachments?.length ?? 0) > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Attachments
                </Typography>

                {item.attachments?.map((attachment) => (
                  <Box
                    key={attachment.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        window.open(attachment.file, "_blank");
                      }}
                    >
                      {attachment.file_name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      }

      break;

    // Note

    case "Note":
      summary = {
        type: item.type,
        heading: `by ${item.author}`,
        subtitle: item.preview ?? "",
        status: item.status ?? "",
        date: formatDate(item.date),
      };

      details = (
        <Box
          sx={{
            mt: 1,
            color: "text.secondary",
            lineHeight: 1.8,

            "& p": {
              margin: 0,
            },

            "& img": {
              maxWidth: "100%",
            },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: item.body ?? "" }} />
        </Box>
      );
      break;

    // Ticket

    // Ticket activity

    case "Ticket":
      summary = {
        type: "",
        heading: item.title ?? "Ticket activity",
        subtitle: `${item.author ?? "Admin"} ${
          item.action ?? "moved ticket to"
        } ${item.status ?? ""}`,
        status: "",
        date: formatDate(item.date),
      };

      showSubtitle = true;
      details = null;
      break;

    // Ticket created

    case "TicketCreated":
      summary = {
        type: "",
        heading: "",
        subtitle: `This ticket was created by ${item.author ?? "Admin"}`,
        status: "",
        date: formatDate(item.date),
      };

      showSubtitle = true;
      details = null;
      break;

    //Deal

    // Deal activity

    case "Deal":
      summary = {
        type: "",
        heading: item.title ?? "",
        subtitle: `${item.author ?? ""} ${item.action ?? ""} ${item.stage ?? ""}`,
        status: "",
        date: formatDate(item.date),
      };

      showSubtitle = true;
      details = null;
      break;

    // Deal created

    case "DealCreated":
      summary = {
        type: "",
        heading: "",
        subtitle: `This deal was created by ${item.author ?? ""}`,
        status: "",
        date: formatDate(item.date),
      };

      showSubtitle = true;
      details = null;
      break;

    default:
      return null;
  }

  const displaySubtitle = (() => {
    if (item.type === "Email") {
      return expanded ? expandedSubtitle : collapsedSubtitle;
    }

    if (item.type === "Meeting") {
      return expanded ? expandedSubtitle : collapsedSubtitle;
    }

    return summary.subtitle;
  })();

  const accordionSubtitle =
    item.type === "Meeting" && expanded ? expandedSubtitle : summary.subtitle;

  const headerSubtitle =
    item.type === "Meeting"
      ? accordionSubtitle
      : item.type === "Email"
        ? expanded
          ? expandedSubtitle
          : collapsedSubtitle
        : displaySubtitle;

  const isHighlightedActivity = item.type === "Deal" || item.type === "Ticket";

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        "&::before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={null}
        sx={{
          px: 2,
          py: 2,
          minHeight: "unset",

          "& .MuiAccordionSummary-content": {
            margin: 0,
          },

          "&.Mui-expanded": {
            minHeight: "unset",
          },

          "&.Mui-expanded .MuiAccordionSummary-content": {
            margin: 0,
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "20px 1fr",
              sm: "20px 1fr auto",
            },
            width: "100%",
            columnGap: 1,
            rowGap: 0.5,
            alignItems: "start",
          }}
        >
          {/* Arrow */}

          <Box
            sx={{
              mt: "2px",
              flexShrink: 0,
            }}
          >
            {expanded ? (
              <ExpandMoreIcon
                sx={{
                  color: "primary.main",
                  fontSize: 18,
                }}
              />
            ) : (
              <ChevronRightIcon
                sx={{
                  color: "primary.main",
                  fontSize: 18,
                }}
              />
            )}
          </Box>

          {/* Left */}
          {/* Left */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",

              gridColumn: {
                xs: "2",
                sm: "2",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                gap: 0.5,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "text.primary",
                  lineHeight: 1.5,
                }}
              >
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {summary.type}
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {summary.heading}
                </Box>
              </Typography>
            </Box>

            {showSubtitle &&
              !!headerSubtitle &&
              (!expanded || item.type !== "Note") &&
              (showTaskCircle ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Box
                    onClick={async (e) => {
                      e.stopPropagation();

                      const newCompleted = !completed;

                      try {
                        await onTaskComplete?.(item.id, newCompleted);

                        setCompleted(newCompleted);
                      } catch (error) {
                        console.error("Failed to update task:", error);
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {completed ? (
                      <CheckCircleIcon
                        sx={{
                          fontSize: 20,
                          color: "success.main",
                        }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{
                          fontSize: 20,
                          color: "text.secondary",
                        }}
                      />
                    )}
                  </Box>

                  {item.type === "Note" ? (
                    <Box
                      component="span"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                        fontSize: "0.75rem",
                        "& p": {
                          margin: 0,
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: displaySubtitle ?? "",
                      }}
                    />
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          "& p": {
                            margin: 0,
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: headerSubtitle ?? "",
                        }}
                      />
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 0.5 }}>
                  {item.type === "Note" ? (
                    <Box
                      component="span"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                        fontSize: "0.75rem",
                        "& p": {
                          margin: 0,
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: displaySubtitle ?? "",
                      }}
                    />
                  ) : item.type === "Deal" || item.type === "Ticket" ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                        }}
                      >
                        {item.author ?? "Admin"}
                      </Box>{" "}
                      <Box component="span">
                        {item.action ?? ""}{" "}
                        {item.type === "Deal"
                          ? (item.stage ?? "")
                          : (item.status ?? "")}
                      </Box>
                    </Typography>
                  ) : item.type === "DealCreated" ||
                    item.type === "TicketCreated" ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.type === "DealCreated"
                        ? "This deal was created by "
                        : "This ticket was created by "}

                      <Box
                        component="span"
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                        }}
                      >
                        {item.author ?? "Admin"}
                      </Box>
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          "& p": {
                            margin: 0,
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: headerSubtitle ?? "",
                        }}
                      />
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: {
                xs: "flex-start",
                sm: "flex-end",
              },
              gap: 0.5,
              whiteSpace: "nowrap",

              gridColumn: {
                xs: "2",
                sm: "3",
              },

              gridRow: {
                xs: "3",
                sm: "1",
              },

              mt: {
                xs: 0.5,
                sm: 0,
              },
            }}
          >
            {summary.status && (
              <>
                {summary.status === "Completed" ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 14,
                      color: "success.main",
                    }}
                  />
                ) : (
                  <CalendarTodayOutlinedIcon
                    sx={{
                      fontSize: 12,
                      color: "error.main",
                    }}
                  />
                )}

                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color:
                      summary.status === "Completed"
                        ? "success.main"
                        : "error.main",
                    fontWeight: 500,
                  }}
                >
                  {summary.status}
                </Typography>

                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  :
                </Typography>
              </>
            )}
            <Typography
              component="span"
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              {summary.date}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          pt: 0,
          px: 2,
          pb: 2,
        }}
      >
        {details}
      </AccordionDetails>
    </Accordion>
  );
}
