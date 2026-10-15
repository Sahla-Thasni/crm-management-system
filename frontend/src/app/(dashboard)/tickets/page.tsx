"use client";

import { useEffect, useState, useRef } from "react";

import ConfirmationDialog from "@/components/form/ConfirmationDialog";

import { Alert, Box, Divider, Paper, Stack, Snackbar } from "@mui/material";

import {
  PageHeader,
  SearchInput,
  PaginationBar,
} from "@/components/listpage/common";

import { TicketsFilters, TicketsTable } from "@/components/listpage/tickets";

import CommonDrawer from "@/components/common/CommonDrawer";
import ImportDrawer from "@/components/common/ImportDrawer";

import TicketForm, { TicketFormRef } from "@/components/createforms/TicketForm";

import { apiRequest } from "@/lib/api";

export default function TicketsPage() {
  const [openCreateTickets, setOpenCreateTickets] = useState(false);
  const [openImportTicket, setOpenImportTicket] = useState(false);

  const [tickets, setTickets] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [ticketStatus, setTicketStatus] = useState("");

  const [ticketOwner, setTicketOwner] = useState("");

  const [priority, setPriority] = useState("");

  const [users, setUsers] = useState<any[]>([]);

  const [page, setPage] = useState(1);

  const pageSize = 10;

  // =====================================================
  // EDIT TICKET STATE
  // =====================================================

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const [openEditTicket, setOpenEditTicket] = useState(false);

  const editTicketFormRef = useRef<TicketFormRef>(null);

  const [savingEditTicket, setSavingEditTicket] = useState(false);

  // =====================================================
  // DELETE CONFIRMATION STATE
  // =====================================================

  const [ticketToDelete, setTicketToDelete] = useState<any | null>(null);

  const [deletingTicket, setDeletingTicket] = useState(false);

  // =====================================================
  // SNACKBAR STATE
  // =====================================================

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  // =====================================================
  // CREATE TICKET FORM REF
  // =====================================================

  const ticketFormRef = useRef<TicketFormRef>(null);

  const [savingTicket, setSavingTicket] = useState(false);

  // =====================================================
  // FETCH TICKETS
  // =====================================================

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      // Search
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      // Ticket Status
      if (ticketStatus) {
        params.append("ticket_status", ticketStatus);
      }

      // Ticket Owner
      if (ticketOwner) {
        params.append("ticket_owner", ticketOwner);
      }

      // Priority
      if (priority) {
        params.append("priority", priority);
      }

      // Pagination
      params.append("page", String(page));

      const queryString = params.toString();

      const endpoint = queryString ? `/tickets/?${queryString}` : "/tickets/";

      console.log("Tickets endpoint:", endpoint);

      const response = await apiRequest<any>(endpoint, {
        method: "GET",
      });

      console.log("Tickets API response:", response);

      setTickets(response.results || []);

      setTotalCount(response.count || 0);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load tickets.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT TICKET
  // =====================================================

  const handleEditTicket = async (ticket: any) => {
    try {
      console.log("Edit clicked:", ticket);

      const response = await apiRequest<any>(`/tickets/${ticket.id}/`, {
        method: "GET",
      });

      console.log("Ticket details:", response);

      setSelectedTicket(response);

      setOpenEditTicket(true);
    } catch (error) {
      console.error("Failed to load ticket:", error);

      showSnackbar(
        error instanceof Error ? error.message : "Failed to load ticket.",
        "error",
      );
    }
  };

  // =====================================================
  // DELETE TICKET
  // =====================================================

  // Open confirmation dialog
  const handleDeleteTicket = (ticket: any) => {
    setTicketToDelete(ticket);
  };

  // =====================================================
  // CANCEL DELETE
  // =====================================================

  const handleCancelDelete = () => {
    if (deletingTicket) {
      return;
    }

    setTicketToDelete(null);
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!ticketToDelete?.id) {
      return;
    }

    try {
      setDeletingTicket(true);

      await apiRequest(`/tickets/${ticketToDelete.id}/`, {
        method: "DELETE",
      });

      showSnackbar("Ticket deleted successfully.", "success");

      setTicketToDelete(null);

      setPage(1);
    } catch (error) {
      console.error("Failed to delete ticket:", error);

      showSnackbar(
        error instanceof Error ? error.message : "Failed to delete ticket.",
        "error",
      );

      setTicketToDelete(null);
    } finally {
      setDeletingTicket(false);
    }
  };

  // =====================================================
  // FETCH TICKETS WHEN SEARCH/FILTER/PAGE CHANGES
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, ticketStatus, ticketOwner, priority, page]);

  // =====================================================
  // FETCH USERS
  // =====================================================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiRequest<any>("/users/list/", {
          method: "GET",
        });

        console.log("Users API response:", response);

        setUsers(response.results || response || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100%",
          p: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "background.paper",
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* HEADER */}

          <PageHeader
            title="Tickets"
            createLabel="Create"
            onCreate={() => {
              console.log("Create button clicked");

              setOpenCreateTickets(true);
            }}
            onImport={() => {
              setOpenImportTicket(true);
            }}
          />

          <Divider
            sx={{
              my: 1,
              mx: -2,
            }}
          />

          {/* SEARCH + PAGINATION */}

          <Stack
            direction={{
              xs: "column",
              sm: "column",
              md: "column",
              lg: "row",
            }}
            spacing={1}
            sx={{
              py: 1,
              gap: 1,
              alignItems: "stretch",

              justifyContent: {
                lg: "space-between",
              },
            }}
          >
            <SearchInput
              placeholder="Search phone, name, city"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
            />

            <PaginationBar
              page={page}
              count={Math.max(1, totalPages)}
              onPageChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </Stack>

          <Divider
            sx={{
              my: 1,
              mx: -2,
            }}
          />

          {/* FILTERS */}

          <Box
            sx={{
              my: 1,
            }}
          >
            <TicketsFilters
              ticketStatus={ticketStatus}
              ticketOwner={ticketOwner}
              priority={priority}
              users={users}
              onTicketStatusChange={(value) => {
                setTicketStatus(value);
                setPage(1);
              }}
              onTicketOwnerChange={(value) => {
                setTicketOwner(value);
                setPage(1);
              }}
              onPriorityChange={(value) => {
                setPriority(value);
                setPage(1);
              }}
            />
          </Box>

          {/* TABLE */}

          <Box
            sx={{
              flex: 1,
              display: "flex",
              minHeight: 0,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  width: "100%",
                  p: 3,
                  textAlign: "center",
                }}
              >
                Loading tickets...
              </Box>
            ) : error ? (
              <Box
                sx={{
                  width: "100%",
                  p: 3,
                  textAlign: "center",
                  color: "error.main",
                }}
              >
                {error}
              </Box>
            ) : (
              <TicketsTable
                data={tickets}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* =====================================================
          CREATE TICKET DRAWER
      ===================================================== */}

      <CommonDrawer
        open={openCreateTickets}
        title="Create Ticket"
        loading={savingTicket}
        onClose={() => {
          setOpenCreateTickets(false);
        }}
        onSave={async () => {
          if (!ticketFormRef.current) {
            console.error("Ticket form ref is not available");

            return;
          }

          try {
            setSavingTicket(true);

            const success = await ticketFormRef.current.submit();

            if (success) {
              setOpenCreateTickets(false);

              // Refresh ticket list
              setPage(1);
            }
          } catch (error) {
            console.error("Create ticket failed:", error);
          } finally {
            setSavingTicket(false);
          }
        }}
      >
        <TicketForm ref={ticketFormRef} showSnackbar={showSnackbar} />
      </CommonDrawer>

      {/* =====================================================
          EDIT TICKET DRAWER
      ===================================================== */}

      <CommonDrawer
        open={openEditTicket}
        title="Edit Ticket"
        loading={savingEditTicket}
        onClose={() => {
          setOpenEditTicket(false);
          setSelectedTicket(null);
        }}
        onSave={async () => {
          if (!editTicketFormRef.current) {
            return;
          }

          try {
            setSavingEditTicket(true);

            const success = await editTicketFormRef.current.submit();

            if (success) {
              setOpenEditTicket(false);
              setSelectedTicket(null);

              showSnackbar("Ticket updated successfully.", "success");

              setPage(1);
            }
          } finally {
            setSavingEditTicket(false);
          }
        }}
      >
        {selectedTicket && (
          <TicketForm
            ref={editTicketFormRef}
            editMode={true}
            initialData={selectedTicket}
            showSnackbar={showSnackbar}
          />
        )}
      </CommonDrawer>
      {/* =====================================================
    IMPORT TICKETS
===================================================== */}

      <ImportDrawer
        open={openImportTicket}
        onClose={() => {
          setOpenImportTicket(false);
        }}
        onSuccess={() => {
          setOpenImportTicket(false);

          fetchTickets();
        }}
        title="Import Tickets"
        endpoint="/tickets/import/"
        description="Upload a CSV file containing ticket information."
        requiredColumns="ticket_name, description, associated_deal, ticket_owner, ticket_status, source, priority"
        example="Payment issue, Customer has an issue with payment, Website Redesign, admin@gmail.com, New, Email, High"
        entityName="tickets"
      />

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <ConfirmationDialog
        open={Boolean(ticketToDelete)}
        title="Delete Ticket"
        message={
          ticketToDelete
            ? `Are you sure you want to delete "${
                ticketToDelete.profile?.ticketName ||
                ticketToDelete.ticket_name ||
                "this ticket"
              }"?`
            : "Are you sure you want to delete this ticket?"
        }
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* =====================================================
          SNACKBAR
      ===================================================== */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
