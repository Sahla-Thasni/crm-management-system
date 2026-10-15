"use client";

import {
  Avatar,
  Box,
  Breadcrumbs,
  IconButton,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import FileCopyRoundedIcon from "@mui/icons-material/FileCopyRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import Link from "next/link";
import {
  AvatarActionSectionProps,
  dealStages,
  moduleTitles,
  ticketStatuses,
} from "@/types/detailspage/avatarAction";

type Props = AvatarActionSectionProps & {
  onActionClick?: (
    type: "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings"
  ) => void;

  onStatusChange?: (value: string) => void;
};
export default function AvatarActionSection({
  module,
  profile,
  onActionClick,
  onStatusChange,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [dealStage, setDealStage] = useState(profile.stage ?? "");
  const [ticketStatus, setTicketStatus] = useState(profile.status ?? "");
  const title =
    module === "lead"
      ? `${profile.firstName} ${profile.lastName}`
      : module === "company"
        ? profile.companyName
        : module === "deal"
          ? profile.dealName
          : profile.ticketName;

  const subtitle =
    module === "lead"
      ? profile.designation
      : module === "company"
        ? profile.industry
        : module === "deal"
          ? `Amount : $${profile.amount?.toLocaleString()}`
          : "";

  const thirdLine =
    module === "lead"
      ? profile.email
      : module === "company"
        ? profile.email
        : module === "deal"
          ? `Stage : ${profile.stage}`
          : "";

  const actions = [
    {
      label: "Note",
      type: "Notes",
      icon: <EditNoteOutlinedIcon fontSize="small" />,
    },
    {
      label: "Email",
      type: "Emails",
      icon: <MailOutlineRoundedIcon fontSize="small" />,
    },
    {
      label: "Call",
      type: "Calls",
      icon: <CallOutlinedIcon fontSize="small" />,
    },
    {
      label: "Task",
      type: "Tasks",
      icon: <TaskAltOutlinedIcon fontSize="small" />,
    },
    {
      label: "Meeting",
      type: "Meetings",
      icon: <CalendarTodayOutlinedIcon fontSize="small" />,
    },
  ] as const;


  const handleCopyEmail = async () => {
    if (!profile.email) return;

    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy email", error);
    }
  };
  const handleStageChange = (event: SelectChangeEvent) => {
    const value = event.target.value;

    setDealStage(value);
    onStatusChange?.(value);
  };
  const handleTicketStatusChange = (
    event: SelectChangeEvent
  ) => {
    const value = event.target.value;

    setTicketStatus(value);
    onStatusChange?.(value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",

        pt: .5,
        px: 2,
        pb: 2,
        boxShadow: "none",
      }}
    >
      <Stack direction="row" sx={{ mb: 2, alignItems: "center", }}>
        <ArrowBackIosNewRoundedIcon
          sx={{
            fontSize: 12,
            color: "text.secondary",
            mr: 0.5,
          }}
        />

        <Breadcrumbs
          separator=""
          aria-label="breadcrumb"
        >
          <Link
            href={
              module === "lead"
                ? "/leads"
                : module === "company"
                  ? "/companies"
                  : module === "deal"
                    ? "/deals"
                    : "/tickets"
            }
            style={{
              textDecoration: "none",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 14,
                color: "text.primary",
              }}
            >
              {moduleTitles[module]}
            </Typography>
          </Link>


        </Breadcrumbs>
      </Stack>

      {/* Avatar & Details */}
      {module === "lead" || module === "company" ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={profile.avatar}
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2,
              bgcolor: "grey.300",
            }}
          />

          <Stack spacing={0.3} sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                lineHeight: "24px",
              }}
            >
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {thirdLine}
              </Typography>
              <IconButton
                size="small"
                onClick={handleCopyEmail}
                sx={{
                  p: 0.25,
                  color: "primary.main",
                }}
              >
                <FileCopyRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: "24px",
            }}
          >
            {title}
          </Typography>

          {module === "deal" ? (
            <Typography variant="body2" color="text.secondary">
              Amount :{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                ${profile.amount?.toLocaleString()}
              </Box>
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {module === "ticket" ? (
            <Stack direction="row" spacing={0.3} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Status :
              </Typography>

              <FormControl variant="standard">
                <Select
                  value={ticketStatus}
                  onChange={handleTicketStatusChange}
                  disableUnderline
                  sx={{
                    color: "text.primary",

                    "& .MuiSelect-select": {
                      p: 0,
                      minHeight: "auto",
                    },

                    "& .MuiSelect-icon": {
                      color: "primary.main",
                    },
                  }}
                >
                  {ticketStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ) : module === "deal" ? (
            <Stack direction="row" spacing={0.3} sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Stage :
              </Typography>

              <FormControl variant="standard">
                <Select
                  value={dealStage}
                  onChange={handleStageChange}
                  disableUnderline
                  sx={{
                    color: "text.primary",

                    "& .MuiSelect-select": {
                      p: 0,
                      minHeight: "auto",
                    },

                    "& .MuiSelect-icon": {
                      color: "primary.main",
                    },
                  }}
                >
                  {dealStages.map((stage) => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ) : (
            thirdLine && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 400,
                  lineHeight: "24px",
                }}
              >
                {thirdLine}
              </Typography>
            )
          )}
        </Stack>
      )}

      {/* Actions */}
      <Box
        sx={{
          mt: 1,
          bgcolor: "background.default",
          borderRadius: 1,
          p: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          {actions.map((action) => (
            <Stack
              key={action.label}
              spacing={0.5}
              sx={{ alignItems: "center" }}
            >
              <IconButton
                size="small"
                onClick={() => onActionClick?.(action.type)}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  color: "primary.main",

                  "& svg": {
                    fontSize: 18,
                  },

                  "&:hover": {
                    bgcolor: "background.paper",
                  },
                }}
              >
                {action.icon}
              </IconButton>

              <Typography variant="caption" color="text.secondary">
                {action.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
