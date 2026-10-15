"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { Box, Grid, useTheme } from "@mui/material";

import FormTextField from "@/components/form/FormTextField";
import FormSelect from "@/components/form/FormSelect";

import { apiRequest } from "@/lib/api";

type TicketFormProps = {
  compact?: boolean;

  // Used when editing
  editMode?: boolean;
  initialData?: any;

  showSnackbar?: (message: string, severity?: "success" | "error") => void;
};

export type TicketFormRef = {
  submit: () => Promise<boolean>;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
};

type Deal = {
  id: number;
  deal_name: string;
};

type TicketFormData = {
  ticketName: string;
  description: string;
  ticketStatus: string;
  source: string;
  priority: string;
  ticketOwner: string[];
  associatedDeal: string;
};

const TicketForm = forwardRef<TicketFormRef, TicketFormProps>(
  function TicketForm(
    {
      compact = false,
      editMode = false,
      initialData,
      showSnackbar,
    },
    ref,
  ) {
    const theme = useTheme();

    const [users, setUsers] = useState<User[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);

    const [formData, setFormData] =
      useState<TicketFormData>({
        ticketName: "",
        description: "",
        ticketStatus: "",
        source: "",
        priority: "",
        ticketOwner: [],
        associatedDeal: "",
      });

    const [loadingUsers, setLoadingUsers] =
      useState(false);

    const [loadingDeals, setLoadingDeals] =
      useState(false);

    // =====================================================
    // FETCH USERS
    // =====================================================

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);

          const response = await apiRequest<any>(
            "/users/list/",
            {
              method: "GET",
            },
          );

          setUsers(
            response.results ||
              response ||
              [],
          );
        } catch (error) {
          console.error(
            "Failed to fetch users:",
            error,
          );
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }, []);

    // =====================================================
    // FETCH DEALS
    // =====================================================

    useEffect(() => {
      const fetchDeals = async () => {
        try {
          setLoadingDeals(true);

          const response = await apiRequest<any>(
            "/deals/",
            {
              method: "GET",
            },
          );

          setDeals(
            response.results ||
              response ||
              [],
          );
        } catch (error) {
          console.error(
            "Failed to fetch deals:",
            error,
          );
        } finally {
          setLoadingDeals(false);
        }
      };

      fetchDeals();
    }, []);

    // =====================================================
    // SET FORM DATA FOR EDIT
    // =====================================================

    useEffect(() => {
      if (!editMode || !initialData) {
        return;
      }

      console.log(
        "Edit ticket data:",
        initialData,
      );

      // ticket_owner is ManyToMany,
      // so Django returns an array of IDs.
      const ownerIds =
        Array.isArray(
          initialData.ticket_owner,
        )
          ? initialData.ticket_owner.map(String)
          : [];

      setFormData({
        ticketName:
          initialData.ticket_name || "",

        description:
          initialData.description || "",

        ticketStatus:
          initialData.ticket_status || "",

        source:
          initialData.source || "",

        priority:
          initialData.priority || "",

        // Load ALL ticket owners
        ticketOwner: ownerIds,

        associatedDeal:
          initialData.associated_deal
            ? String(
                initialData.associated_deal,
              )
            : "",
      });
    }, [editMode, initialData]);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (
      field: keyof TicketFormData,
      value: string | string[],
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // Used for single-select fields
    const getSelectValue = (
      value: string | string[],
    ): string => {
      return Array.isArray(value)
        ? (value[0] ?? "")
        : value;
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    useImperativeHandle(
      ref,
      () => ({
        submit: async () => {
          try {
            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
              !formData.ticketName.trim()
            ) {
              showSnackbar?.(
                "Ticket Name is required.",
                "error",
              );
              return false;
            }

            if (!formData.ticketStatus) {
              showSnackbar?.(
                "Ticket Status is required.",
                "error",
              );
              return false;
            }

            if (!formData.source) {
              showSnackbar?.(
                "Source is required.",
                "error",
              );
              return false;
            }

            if (!formData.priority) {
              showSnackbar?.(
                "Priority is required.",
                "error",
              );
              return false;
            }

            // Multiple owner validation
            if (
              !Array.isArray(
                formData.ticketOwner,
              ) ||
              formData.ticketOwner.length === 0
            ) {
              showSnackbar?.(
                "Ticket Owner is required.",
                "error",
              );
              return false;
            }

            if (
              !formData.associatedDeal
            ) {
              showSnackbar?.(
                "Associated Deal is required.",
                "error",
              );
              return false;
            }

            // ---------------------------------------------
            // PAYLOAD
            // ---------------------------------------------

            const payload = {
              ticket_name:
                formData.ticketName.trim(),

              description:
                formData.description.trim(),

              associated_deal:
                Number(
                  formData.associatedDeal,
                ),

              ticket_status:
                formData.ticketStatus,

              source:
                formData.source,

              priority:
                formData.priority,

              // Multiple ticket owners
              ticket_owner:
                formData.ticketOwner
                  .map(Number)
                  .filter((id) =>
                    Number.isFinite(id),
                  ),

              is_active: true,
            };

            console.log(
              editMode
                ? "Updating ticket:"
                : "Creating ticket:",
              payload,
            );

            // ---------------------------------------------
            // CREATE
            // ---------------------------------------------

            if (!editMode) {
              await apiRequest(
                "/tickets/",
                {
                  method: "POST",
                  body: JSON.stringify(
                    payload,
                  ),
                },
              );

              return true;
            }

            // ---------------------------------------------
            // EDIT
            // ---------------------------------------------

            if (!initialData?.id) {
              showSnackbar?.(
                "Ticket ID is missing.",
                "error",
              );
              return false;
            }

            await apiRequest(
              `/tickets/${initialData.id}/`,
              {
                method: "PATCH",
                body: JSON.stringify(
                  payload,
                ),
              },
            );

            return true;
          } catch (error) {
            console.error(
              editMode
                ? "Failed to update ticket:"
                : "Failed to create ticket:",
              error,
            );

            showSnackbar?.(
              error instanceof Error
                ? error.message
                : editMode
                  ? "Failed to update ticket."
                  : "Failed to create ticket.",
              "error",
            );

            return false;
          }
        },
      }),
      [
        formData,
        editMode,
        initialData,
        showSnackbar,
      ],
    );

    const gap =
      compact ? 1 : 1.5;

    const fieldSx = {
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor:
          theme.palette.background.paper,
      },
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap,
        }}
      >
        {/* =====================================================
            TICKET NAME
        ===================================================== */}

        <FormTextField
          label="Ticket Name"
          required
          placeholder="Enter"
          fullWidth
          size="small"
          sx={fieldSx}
          value={formData.ticketName}
          onChange={(e) =>
            handleChange(
              "ticketName",
              e.target.value,
            )
          }
        />

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <FormTextField
          label="Description"
          placeholder="Enter"
          multiline
          rows={3}
          fullWidth
          value={formData.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value,
            )
          }
        />

        {/* =====================================================
            STATUS + SOURCE
        ===================================================== */}

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormSelect
              label="Ticket Status"
              required
              placeholder="Choose"
              value={
                formData.ticketStatus
              }
              onChange={(value) =>
                handleChange(
                  "ticketStatus",
                  getSelectValue(
                    value,
                  ),
                )
              }
              options={[
                {
                  label: "New",
                  value: "New",
                },
                {
                  label: "Open",
                  value: "Open",
                },
                {
                  label:
                    "Waiting on contact",
                  value:
                    "Waiting on contact",
                },
                {
                  label:
                    "Waiting on us",
                  value:
                    "Waiting on us",
                },
                {
                  label: "Closed",
                  value: "Closed",
                },
              ]}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormSelect
              label="Source"
              required
              placeholder="Choose"
              value={
                formData.source
              }
              onChange={(value) =>
                handleChange(
                  "source",
                  getSelectValue(
                    value,
                  ),
                )
              }
              options={[
                {
                  label: "Email",
                  value: "Email",
                },
                {
                  label: "Phone",
                  value: "Phone",
                },
                {
                  label: "Chat",
                  value: "Chat",
                },
              ]}
            />
          </Grid>
        </Grid>

        {/* =====================================================
            PRIORITY
        ===================================================== */}

        <FormSelect
          label="Priority"
          required
          placeholder="Choose"
          value={
            formData.priority
          }
          onChange={(value) =>
            handleChange(
              "priority",
              getSelectValue(
                value,
              ),
            )
          }
          options={[
            {
              label: "Low",
              value: "Low",
            },
            {
              label: "Medium",
              value: "Medium",
            },
            {
              label: "High",
              value: "High",
            },
            {
              label: "Critical",
              value: "Critical",
            },
          ]}
        />

        {/* =====================================================
            TICKET OWNER - MULTIPLE SELECT
        ===================================================== */}

        <FormSelect
          label="Ticket Owner"
          required
          multiple
          placeholder={
            loadingUsers
              ? "Loading users..."
              : "Choose"
          }
          value={
            formData.ticketOwner
          }
          onChange={(value) => {
            const selectedOwners =
              Array.isArray(value)
                ? value.map(String)
                : [];

            handleChange(
              "ticketOwner",
              selectedOwners,
            );
          }}
          options={users.map(
            (user) => ({
              label:
                `${user.first_name ?? ""} ${
                  user.last_name ?? ""
                }`.trim(),

              value: String(
                user.id,
              ),
            }),
          )}
        />

        {/* =====================================================
            ASSOCIATED DEAL
        ===================================================== */}

        <FormSelect
          label="Associated Deal"
          required
          placeholder={
            loadingDeals
              ? "Loading deals..."
              : "Choose"
          }
          value={
            formData.associatedDeal
          }
          onChange={(value) =>
            handleChange(
              "associatedDeal",
              getSelectValue(
                value,
              ),
            )
          }
          options={deals.map(
            (deal) => ({
              label:
                deal.deal_name,
              value: String(
                deal.id,
              ),
            }),
          )}
        />
      </Box>
    );
  },
);

TicketForm.displayName =
  "TicketForm";

export default TicketForm;