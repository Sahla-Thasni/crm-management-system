"use client";

import { useEffect, useMemo, useState } from "react";

import { Box, Divider, Paper, Stack } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";

import { fetchLeads } from "@/store/slices/leadsSlice";

import type { Lead } from "@/store/slices/leadsSlice";

import {
  PageHeader,
  SearchInput,
  PaginationBar,
} from "@/components/listpage/common";

import { LeadsFilters, LeadsTable } from "@/components/listpage/leads";

import CommonDrawer from "@/components/common/CommonDrawer";
import Button from "@mui/material/Button";
import ImportDrawer from "@/components/common/ImportDrawer";

import LeadForm from "@/components/createforms/LeadForm";
import dayjs, { Dayjs } from "dayjs";
import ConfirmationDialog from "@/components/form/ConfirmationDialog";
import { apiRequest } from "@/lib/api";

// =====================================================
// UPDATE FUNCTION TYPE
// =====================================================

type UpdateFunction = () => void | Promise<void>;

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [createdDate, setCreatedDate] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // =====================================================
  // CREATE
  // =====================================================

  const [openCreateLead, setOpenCreateLead] = useState(false);

  // =====================================================
  // EDIT
  // =====================================================

  const [openEditLead, setOpenEditLead] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openImportLead, setOpenImportLead] = useState(false);

  // =====================================================
  // DELETE CONFIRMATION
  // =====================================================

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // =====================================================
  // UPDATE CONFIRMATION
  // =====================================================

  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  const [pendingUpdate, setPendingUpdate] = useState<UpdateFunction | null>(
    null,
  );

  // =====================================================
  // REDUX
  // =====================================================
  const dispatch = useDispatch<AppDispatch>();

  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    totalCount,
    currentPage,
    pageSize,
  } = useSelector((state: RootState) => state.leads);
  // =====================================================
  // FETCH LEADS
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchLeads({
          search,
          created_at: createdDate ? createdDate.format("YYYY-MM-DD") : "",
          lead_status: leadStatus,
          page: currentPage,
          page_size: pageSize,
        }),
      );
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [dispatch, search, createdDate, leadStatus, currentPage, pageSize]);
  // =====================================================
  // SEARCH LEADS
  // =====================================================

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      // SEARCH
      const name = `${lead.first_name ?? ""} ${
        lead.last_name ?? ""
      }`.toLowerCase();

      const email = String(lead.email ?? "").toLowerCase();

      const phone = String(lead.phone_number ?? "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      // STATUS
      const matchesStatus =
        !leadStatus ||
        String(lead.lead_status ?? "").toLowerCase() ===
          leadStatus.toLowerCase();
      //Date
      const matchesCreatedDate =
        !createdDate ||
        (lead.created_at &&
          new Date(lead.created_at).toDateString() ===
            createdDate.toDate().toDateString());
      return matchesSearch && matchesStatus && matchesCreatedDate;
    });
  }, [leads, search, leadStatus, createdDate]);
  // =====================================================
  // CREATE
  // =====================================================

  const handleCreateLead = () => {
    setSelectedLead(null);
    setOpenCreateLead(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateLead(false);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEditLead = (lead: Lead) => {
    console.log("Opening edit lead:", lead);

    setSelectedLead(lead);
    setOpenEditLead(true);
  };

  // =====================================================
  // CLOSE EDIT
  // =====================================================

  const handleCloseEdit = () => {
    setOpenEditLead(false);
    setSelectedLead(null);

    // Also clear any pending update
    setPendingUpdate(null);
    setOpenUpdateDialog(false);
  };

  // =====================================================
  // UPDATE REQUEST
  //
  // This is called by LeadForm when the user
  // clicks "Update Lead".
  // =====================================================

  const handleUpdateRequest = (updateFunction: UpdateFunction) => {
    console.log("Update requested - opening confirmation");

    setPendingUpdate(() => updateFunction);

    setOpenUpdateDialog(true);
  };

  // =====================================================
  // CANCEL UPDATE
  // =====================================================

  const handleCancelUpdate = () => {
    setOpenUpdateDialog(false);
    setPendingUpdate(null);
  };

  // =====================================================
  // CONFIRM UPDATE
  // =====================================================

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate) {
      console.error("No pending update function");

      return;
    }

    try {
      console.log("Confirming lead update...");

      // Execute LeadForm's PATCH request
      await pendingUpdate();

      // Close confirmation
      setOpenUpdateDialog(false);
      setPendingUpdate(null);

      // Refresh table
      await dispatch(fetchLeads());

      // Close edit drawer
      setOpenEditLead(false);
      setSelectedLead(null);

      console.log("Lead updated successfully");
    } catch (error) {
      console.error("Failed to update lead:", error);

      // Keep confirmation open if API fails
    }
  };

  // =====================================================
  // DELETE REQUEST
  // =====================================================

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setOpenDeleteDialog(true);
  };

  // =====================================================
  // CANCEL DELETE
  // =====================================================

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setLeadToDelete(null);
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!leadToDelete?.id) {
      return;
    }

    try {
      console.log("Deleting lead:", leadToDelete.id);

      await apiRequest(`/leads/${leadToDelete.id}/`, {
        method: "DELETE",
      });

      console.log("Lead deleted successfully");

      // Close confirmation dialog
      setOpenDeleteDialog(false);
      setLeadToDelete(null);

      // Refresh leads list
      dispatch(fetchLeads());
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };
  const handlePageChange = (page: number) => {
    console.log("Changing page:", page);

    dispatch(
      fetchLeads({
        search,

        created_at: createdDate ? createdDate.format("YYYY-MM-DD") : "",

        lead_status: selectedStatus || "",

        page,

        page_size: pageSize,
      }),
    );
  };
  // =====================================================
  // UI
  // =====================================================

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
            title="Leads"
            createLabel="Create"
            onCreate={handleCreateLead}
            onImport={() => setOpenImportLead(true)}
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
              placeholder="Search phone, name, email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />

            <PaginationBar
              page={currentPage}
              count={Math.ceil(totalCount / pageSize)}
              onPageChange={handlePageChange}
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
            <LeadsFilters
              leadStatus={leadStatus}
              onLeadStatusChange={setLeadStatus}
              createdDate={createdDate}
              onCreatedDateChange={setCreatedDate}
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
            {leadsLoading ? (
              <Box sx={{ p: 2 }}>Loading leads...</Box>
            ) : leadsError ? (
              <Box
                sx={{
                  p: 2,
                  color: "error.main",
                }}
              >
                {leadsError}
              </Box>
            ) : (
              <LeadsTable
                data={filteredLeads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* =====================================================
    CREATE LEAD DRAWER
===================================================== */}
      <CommonDrawer
        open={openCreateLead}
        title="Create Lead"
        onClose={handleCloseCreate}
        onSave={() => {
          const form = document.getElementById(
            "lead-form",
          ) as HTMLFormElement | null;

          console.log("SAVE BUTTON CLICKED");
          console.log("FORM FOUND:", form);

          form?.requestSubmit();
        }}
      >
        <LeadForm
          onSuccess={() => {
            handleCloseCreate();
            dispatch(fetchLeads());
          }}
        />
      </CommonDrawer>
      {/* =====================================================
    EDIT LEAD DRAWER
===================================================== */}

      <CommonDrawer
        open={openEditLead}
        title="Edit Lead"
        onClose={handleCloseEdit}
        onSave={() => {
          const form = document.getElementById("edit-lead-form");

          if (form instanceof HTMLFormElement) {
            form.requestSubmit();
          }
        }}
      >
        {selectedLead && (
          <LeadForm
            lead={selectedLead}
            formId="edit-lead-form"
            onSuccess={() => {
              handleCloseEdit();
              dispatch(fetchLeads());
            }}
          />
        )}
      </CommonDrawer>
      <ImportDrawer
        open={openImportLead}
        onClose={() => {
          setOpenImportLead(false);
        }}
        onSuccess={() => {
          setOpenImportLead(false);
          dispatch(fetchLeads());
        }}
        title="Import Leads"
        endpoint="/leads/import/"
        description="Upload a CSV file containing lead information."
        requiredColumns="email, first_name, last_name, phone_number, job_title, contact_owner, products, company, city, lead_status, lead_date"
        example='john.doe@example.com, John, Doe, 9876500101, Sales Manager, "admin@gmail.com, John Manager", "Product A, Product B", Sunrise Digital Solutions, Dubai, New, 2026-08-22'
        entityName="leads"
      />

      {/* =====================================================
    UPDATE CONFIRMATION
===================================================== */}

      <ConfirmationDialog
        open={openUpdateDialog}
        title="Update Lead"
        message={
          selectedLead
            ? `Are you sure you want to update "${selectedLead.first_name ?? ""} ${selectedLead.last_name ?? ""}"?`
            : "Are you sure you want to update this lead?"
        }
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        confirmText="Update"
        cancelText="Cancel"
      />

      {/* =====================================================
    DELETE CONFIRMATION
===================================================== */}

      <ConfirmationDialog
        open={openDeleteDialog}
        title="Delete Lead"
        message={
          leadToDelete
            ? `Are you sure you want to delete "${leadToDelete.first_name} ${leadToDelete.last_name}"?`
            : "Are you sure you want to delete this lead?"
        }
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
