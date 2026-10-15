"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  Paper,
  CircularProgress,
  ClickAwayListener,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuIcon from "@mui/icons-material/Menu";

import MobileDrawer from "./MobileDrawer";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { apiRequest } from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

type SearchResult = {
  type: "lead" | "company" | "deal" | "ticket";
  id: number;

  // Lead
  first_name?: string;
  last_name?: string;
  status?: string;
  phone_number?: string;
  company?: string | null;

  // Company
  company_name?: string;
  city?: string;

  // Deal
  deal_name?: string;
  amount?: number | string;

  // Ticket
  ticket_name?: string;
  priority?: string;
};

type GlobalSearchResponse = {
  search: string;
  results: SearchResult[];
};

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

// =====================================================
// API URLS
// =====================================================

const GLOBAL_SEARCH_URL = "/global-search/";

const NOTIFICATIONS_URL = "/notifications/";

// =====================================================
// GET USER INITIAL
// =====================================================

const getUserInitial = () => {
  if (typeof window === "undefined") {
    return "U";
  }

  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return "U";
    }

    const user = JSON.parse(storedUser);

    const name =
      user?.first_name ||
      user?.firstName ||
      user?.name ||
      user?.username ||
      user?.email;

    if (!name) {
      return "U";
    }

    return String(name).charAt(0).toUpperCase();
  } catch (error) {
    console.error("Unable to read user:", error);

    return "U";
  }
};

// =====================================================
// FORMAT NOTIFICATION TIME
// =====================================================

const formatNotificationTime = (createdAt: string) => {
  const date = new Date(createdAt);

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// =====================================================
// NAVBAR
// =====================================================

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const theme = useTheme();

  // ===================================================
  // DRAWER
  // ===================================================

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ===================================================
  // NOTIFICATION
  // ===================================================

  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [notificationLoading, setNotificationLoading] = useState(false);

  const [markingNotification, setMarkingNotification] = useState<number | null>(
    null,
  );

  // ===================================================
  // PROFILE
  // ===================================================

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  // ===================================================
  // USER INITIAL
  // ===================================================

  const [userInitial, setUserInitial] = useState("U");

  // ===================================================
  // GLOBAL SEARCH
  // ===================================================

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // ===================================================
  // ICON BUTTON STYLE
  // ===================================================

  const iconButtonStyle = {
    width: 46,
    height: 46,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    padding: 0,

    "&:hover": {
      backgroundColor: theme.palette.background.default,
      borderColor: theme.palette.primary.main,
    },
  };

  // ===================================================
  // LOAD USER INITIAL
  // ===================================================

  useEffect(() => {
    setUserInitial(getUserInitial());
  }, []);

  // ===================================================
  // FETCH NOTIFICATIONS
  // ===================================================

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await apiRequest(NOTIFICATIONS_URL, {
        method: "GET",
      });

      console.log("Notifications Response:", response);

      if (Array.isArray(response)) {
        setNotifications(response);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Notification API error:", error);

      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ===================================================
  // FETCH NOTIFICATIONS ON LOAD
  // ===================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ===================================================
  // UNREAD COUNT
  // ===================================================

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  // ===================================================
  // OPEN NOTIFICATION MENU
  // ===================================================

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);

    /*
     * Refresh notifications whenever
     * the notification menu is opened.
     */
    fetchNotifications();
  };

  // ===================================================
  // MARK NOTIFICATION AS READ
  // ===================================================

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      setMarkingNotification(notification.id);

      await apiRequest(`${NOTIFICATIONS_URL}${notification.id}/`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    } finally {
      setMarkingNotification(null);
    }
  };

  // ===================================================
  // VIEW ALL NOTIFICATIONS
  // ===================================================

  const handleViewAllNotifications = () => {
    setNotificationAnchor(null);

    router.push("/notifications/");
  };

  // ===================================================
  // GLOBAL SEARCH
  // ===================================================

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchOpen(false);

      return;
    }

    setSearchOpen(true);

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = (await apiRequest(
          `${GLOBAL_SEARCH_URL}?search=${encodeURIComponent(trimmedSearch)}`,
          {
            method: "GET",
          },
        )) as GlobalSearchResponse;

        console.log("Global Search Response:", response);

        setSearchResults(response.results || []);
      } catch (error) {
        console.error("Global search error:", error);

        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ===================================================
  // SEARCH RESULT TITLE
  // ===================================================

  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case "lead":
        return `${result.first_name || ""} ${result.last_name || ""}`.trim();

      case "company":
        return result.company_name || "Company";

      case "deal":
        return result.deal_name || "Deal";

      case "ticket":
        return result.ticket_name || "Ticket";

      default:
        return "Result";
    }
  };

  // ===================================================
  // SEARCH RESULT SUBTITLE
  // ===================================================

  const getResultSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case "lead":
        return result.company || result.phone_number || "";

      case "company":
        return result.city || result.phone_number || "";

      case "deal":
        return result.amount ? `Amount: ${result.amount}` : "";

      case "ticket":
        return result.priority ? `Priority: ${result.priority}` : "";

      default:
        return "";
    }
  };

  // ===================================================
  // SEARCH RESULT STATUS
  // ===================================================

  const getResultStatus = (result: SearchResult) => {
    if (!result.status) {
      return "";
    }

    return result.status;
  };

  // ===================================================
  // SEARCH RESULT CLICK
  // ===================================================

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearch("");

    switch (result.type) {
      case "lead":
        router.push(`/leads/${result.id}`);
        break;

      case "company":
        router.push(`/companies/${result.id}`);
        break;

      case "deal":
        router.push(`/deals/${result.id}`);
        break;

      case "ticket":
        router.push(`/tickets/${result.id}`);
        break;

      default:
        break;
    }
  };

  // ===================================================
  // VIEW ALL SEARCH RESULTS
  // ===================================================

  const handleViewAllResults = () => {
    const query = search.trim();

    if (!query) {
      return;
    }

    setSearchOpen(false);

    router.push(`/search?search=${encodeURIComponent(query)}`);
  };

  // ===================================================
  // SEARCH INPUT
  // ===================================================

  const searchInput = (
    <TextField
      fullWidth
      size="small"
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
      }}
      onFocus={() => {
        if (search.trim()) {
          setSearchOpen(true);
        }
      }}
      placeholder="Search..."
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "background.default",
        },
      }}
    />
  );

  // ===================================================
  // SEARCH DROPDOWN
  // ===================================================

  const searchDropdown = searchOpen ? (
    <Paper
      elevation={8}
      sx={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        right: 0,
        maxHeight: 430,
        overflowY: "auto",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.modal,
      }}
    >
      {searchLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : searchResults.length === 0 ? (
        <Box
          sx={{
            px: 2,
            py: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No results found
          </Typography>
        </Box>
      ) : (
        <>
          {searchResults.map((result) => (
            <Box
              key={`${result.type}-${result.id}`}
              onClick={() => handleSearchResultClick(result)}
              sx={{
                px: 2,
                py: 1.5,
                cursor: "pointer",
                borderBottom: `1px solid ${theme.palette.divider}`,

                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                    noWrap
                  >
                    {getResultTitle(result)}
                  </Typography>

                  {getResultSubtitle(result) && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {getResultSubtitle(result)}
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "capitalize",
                    color: "primary.main",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {result.type}
                </Typography>
              </Box>

              {getResultStatus(result) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  {getResultStatus(result)}
                </Typography>
              )}
            </Box>
          ))}

          <Box
            onClick={handleViewAllResults}
            sx={{
              px: 2,
              py: 1.5,
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: theme.palette.background.default,

              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Typography
              variant="body2"
              color="primary"
              sx={{
                fontWeight: 600,
              }}
            >
              View all results
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  ) : null;

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <>
      <AppBar
        position="fixed"
        elevation={3}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        {/* =================================================
            TOOLBAR
        ================================================= */}

        <Toolbar
          sx={{
            justifyContent: "space-between",
            height: 72,
            minHeight: 72,
            px: {
              xs: 2,
              md: 3,
            },
          }}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: {
                  xs: "flex",
                  sm: "none",
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: 1,
              }}
            >
              CRM
            </Typography>
          </Box>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* =================================================
                DESKTOP SEARCH
            ================================================= */}

            <Box
              ref={searchContainerRef}
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                width: 500,
                position: "relative",
              }}
            >
              <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                <Box>
                  {searchInput}

                  {searchDropdown}
                </Box>
              </ClickAwayListener>
            </Box>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* AI */}

              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                }}
              >
                <IconButton sx={iconButtonStyle}>
                  <Box
                    component="img"
                    src="/ai-chatpot.jpg"
                    alt="AI"
                    sx={{
                      width: 42,
                      height: 42,
                      objectFit: "contain",
                    }}
                  />
                </IconButton>
              </Box>

              {/* =================================================
                  NOTIFICATION BUTTON
              ================================================= */}

              <IconButton sx={iconButtonStyle} onClick={handleNotificationOpen}>
                <Badge
                  badgeContent={
                    unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount
                  }
                  color="primary"
                  overlap="circular"
                  invisible={unreadNotificationCount === 0}
                >
                  <NotificationsOutlinedIcon fontSize="small" />
                </Badge>
              </IconButton>

              {/* =================================================
                  PROFILE
              ================================================= */}

              <IconButton
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "10px",
                  bgcolor: "primary.main",
                  color: "#fff",
                  border: `1px solid ${theme.palette.primary.main}`,

                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {userInitial}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>

        {/* =================================================
            MOBILE SEARCH
        ================================================= */}

        <Box
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
            px: 2,
            pb: 2,
            position: "relative",
          }}
        >
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box>
              {searchInput}

              {searchDropdown}
            </Box>
          </ClickAwayListener>
        </Box>
      </AppBar>

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* =================================================
          NOTIFICATION MENU
      ================================================= */}

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: 500,
              borderRadius: 2,
            },
          },
        }}
      >
        {/* Notification Header */}

        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              Notifications
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {unreadNotificationCount} unread
            </Typography>
          </Box>

          <NotificationsOutlinedIcon color="primary" />
        </Box>

        <Divider />

        {/* Notification Loading */}

        {notificationLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 3,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}

        {/* No Notifications */}

        {!notificationLoading && notifications.length === 0 && (
          <Box
            sx={{
              px: 2,
              py: 4,
              textAlign: "center",
            }}
          >
            <NotificationsOutlinedIcon
              sx={{
                fontSize: 40,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}

        {/* Notifications */}

        {!notificationLoading && notifications.length > 0 && (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                disabled={markingNotification === notification.id}
                sx={{
                  display: "block",
                  whiteSpace: "normal",
                  px: 2,
                  py: 1.5,

                  backgroundColor: notification.is_read
                    ? "transparent"
                    : "action.hover",

                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                  }}
                >
                  {/* Unread Indicator */}

                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      borderRadius: "50%",
                      bgcolor: notification.is_read
                        ? "transparent"
                        : "primary.main",
                      mt: 0.8,
                    }}
                  />

                  {/* Message */}

                  <Box
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.is_read ? 400 : 600,
                      }}
                    >
                      {notification.message}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {formatNotificationTime(notification.created_at)}
                    </Typography>

                    {!notification.is_read && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        Click to mark as read
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}

            <Divider />

            {/* View All */}

            <Box
              onClick={handleViewAllNotifications}
              sx={{
                px: 2,
                py: 1.5,
                cursor: "pointer",
                textAlign: "center",

                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  fontWeight: 600,
                }}
              >
                View all notifications
              </Typography>
            </Box>
          </>
        )}
      </Menu>

      {/* =================================================
          PROFILE MENU
      ================================================= */}

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      >
        <MenuItem>My Profile</MenuItem>

        <MenuItem>Settings</MenuItem>

        <Divider />

        <Box
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1,
            }}
            onClick={async () => {
              setProfileAnchor(null);

              const refreshToken = localStorage.getItem("refreshToken");

              try {
                if (refreshToken) {
                  await apiRequest("/users/logout/", {
                    method: "POST",
                    body: JSON.stringify({
                      refresh: refreshToken,
                    }),
                  });
                }
              } catch (error) {
                console.error("Logout API error:", error);
              } finally {
                dispatch(logout());

                localStorage.removeItem("accessToken");

                localStorage.removeItem("refreshToken");

                localStorage.removeItem("user");

                router.replace("/login");
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </>
  );
}
