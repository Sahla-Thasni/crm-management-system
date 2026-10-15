"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Button,
  Divider,
} from "@mui/material";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

// =====================================================
// API
// =====================================================

const NOTIFICATIONS_URL = "/notifications/";

// =====================================================
// PAGE
// =====================================================

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [markingRead, setMarkingRead] =
    useState<number | null>(null);

  // ===================================================
  // FETCH NOTIFICATIONS
  // ===================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(
        NOTIFICATIONS_URL,
        {
          method: "GET",
        }
      );

      console.log(
        "Notifications Response:",
        response
      );

      setNotifications(
        Array.isArray(response)
          ? response
          : []
      );
    } catch (error) {
      console.error(
        "Notifications API error:",
        error
      );

      setError(
        "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ===================================================
  // MARK NOTIFICATION AS READ
  // ===================================================

  const handleMarkAsRead = async (
    notificationId: number
  ) => {
    try {
      setMarkingRead(notificationId);

      const response = await apiRequest(
        `${NOTIFICATIONS_URL}${notificationId}/`,
        {
          method: "PATCH",
        }
      );

      console.log(
        "Notification marked as read:",
        response
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    } finally {
      setMarkingRead(null);
    }
  };

  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ===================================================
  // UNREAD COUNT
  // ===================================================

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read
  ).length;

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: 3,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => router.back()}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
              }}
            >
              Notifications
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Your notifications and updates
            </Typography>
          </Box>
        </Box>

        {/* =================================================
            UNREAD COUNT
        ================================================= */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <NotificationsOutlinedIcon
            color="primary"
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {unreadCount} unread
          </Typography>
        </Box>
      </Box>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <Paper
          elevation={0}
          sx={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <CircularProgress />
        </Paper>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            color="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Typography>

          <Button
            variant="contained"
            onClick={fetchNotifications}
          >
            Try Again
          </Button>
        </Paper>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        notifications.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <NotificationsOutlinedIcon
              sx={{
                fontSize: 55,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              No notifications
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              You don't have any notifications
              right now.
            </Typography>
          </Paper>
        )}

      {/* =================================================
          NOTIFICATION LIST
      ================================================= */}

      {!loading &&
        !error &&
        notifications.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Header */}

            <Box
              sx={{
                px: 2,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  All Notifications
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {notifications.length}{" "}
                  notification
                  {notifications.length !== 1
                    ? "s"
                    : ""}
                </Typography>
              </Box>

              <DoneAllIcon
                color="action"
              />
            </Box>

            <Divider />

            {/* Notification Items */}

            {notifications.map(
              (notification, index) => (
                <Box
                  key={notification.id}
                  sx={{
                    px: {
                      xs: 2,
                      sm: 3,
                    },
                    py: 2,

                    bgcolor:
                      notification.is_read
                        ? "background.paper"
                        : "action.hover",

                    borderBottom:
                      index !==
                      notifications.length - 1
                        ? 1
                        : 0,

                    borderColor: "divider",

                    transition:
                      "background-color 0.2s",

                    "&:hover": {
                      bgcolor:
                        "action.selected",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems:
                        "flex-start",
                      gap: 2,
                    }}
                  >
                    {/* Notification Icon */}

                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        minWidth: 42,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        bgcolor:
                          notification.is_read
                            ? "action.hover"
                            : "primary.main",
                        color:
                          notification.is_read
                            ? "text.secondary"
                            : "#fff",
                      }}
                    >
                      <NotificationsOutlinedIcon
                        fontSize="small"
                      />
                    </Box>

                    {/* Content */}

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems:
                            "flex-start",
                          justifyContent:
                            "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              notification.is_read
                                ? 400
                                : 600,
                          }}
                        >
                          {
                            notification.message
                          }
                        </Typography>

                        {!notification.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              minWidth: 8,
                              borderRadius:
                                "50%",
                              bgcolor:
                                "primary.main",
                              mt: 1,
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        {formatDate(
                          notification.created_at
                        )}
                      </Typography>

                      {/* Mark as Read */}

                      {!notification.is_read && (
                        <Button
                          size="small"
                          variant="text"
                          disabled={
                            markingRead ===
                            notification.id
                          }
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id
                            )
                          }
                          sx={{
                            mt: 1,
                            px: 0,
                            minWidth: "auto",
                            textTransform:
                              "none",
                          }}
                        >
                          {markingRead ===
                          notification.id
                            ? "Marking..."
                            : "Mark as read"}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            )}
          </Paper>
        )}
    </Box>
  );
}