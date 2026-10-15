"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, Box, Divider, Paper, Snackbar, Stack } from "@mui/material";

import type { AlertColor } from "@mui/material";

import {
  PageHeader,
  SearchInput,
  PaginationBar,
} from "@/components/listpage/common";

import { DealsFilters, DealsTable } from "@/components/listpage/deals";

import CommonDrawer from "@/components/common/CommonDrawer";
import ImportDrawer from "@/components/common/ImportDrawer";

import DealForm, {
  DealFormRef,
  type DealFormData,
} from "@/components/createforms/DealForm";

import ConfirmationDialog from "@/components/form/ConfirmationDialog";

import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";

import type { Dayjs } from "dayjs";

import {
  fetchDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  type Deal,
} from "@/store/slices/dealsSlice";

import { fetchLeads } from "@/store/slices/leadsSlice";
import { fetchUsers } from "@/store/slices/usersSlice";

export default function DealsPage() {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // DEAL FORM REF
  // =====================================================

  const dealFormRef = useRef<DealFormRef>(null);

  // =====================================================
  // CREATE / EDIT STATE
  // =====================================================

  const [openCreateDeal, setOpenCreateDeal] = useState(false);

  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [saving, setSaving] = useState(false);

  const [openImportDeal, setOpenImportDeal] = useState(false);
  // =====================================================
  // SEARCH / PAGINATION
  // =====================================================

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  // =====================================================
  // FILTER STATE
  // =====================================================

  const [dealOwnerFilter, setDealOwnerFilter] = useState("");

  const [dealStageFilter, setDealStageFilter] = useState("");

  const [closeDateFilter, setCloseDateFilter] = useState<Dayjs | null>(null);

  // =====================================================
  // DELETE CONFIRMATION STATE
  // =====================================================

  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // SNACKBAR STATE
  // =====================================================

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("error");

  // =====================================================
  // REDUX STATE
  // =====================================================

  const { deals, count, loading, error } = useSelector(
    (state: RootState) => state.deals,
  );

  // =====================================================
  // API ERROR MESSAGE
  // =====================================================

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const rawMessage =
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : fallback;

    try {
      const response = JSON.parse(rawMessage) as Record<
        string,
        string | string[]
      >;

      if (typeof response.detail === "string") {
        return response.detail;
      }

      const firstError = Object.values(response)[0];

      if (Array.isArray(firstError)) {
        return firstError[0] ?? fallback;
      }

      return firstError || rawMessage;
    } catch {
      return rawMessage;
    }
  };

  // =====================================================
  // FETCH DEALS
  // =====================================================

  useEffect(() => {
    dispatch(
      fetchDeals({
        page,
        pageSize,
        search,
        deal_owner: dealOwnerFilter || undefined,
        deal_stage: dealStageFilter || undefined,
        close_date: closeDateFilter
          ? closeDateFilter.format("YYYY-MM-DD")
          : undefined,
      }),
    );
  }, [
    dispatch,
    page,
    pageSize,
    search,
    dealOwnerFilter,
    dealStageFilter,
    closeDateFilter,
  ]);

  // =====================================================
  // FETCH LEADS + USERS
  // =====================================================

  useEffect(() => {
    dispatch(
      fetchLeads({
        page: 1,
        page_size: 100,
      }),
    );

    dispatch(fetchUsers());
  }, [dispatch]);

  // =====================================================
  // CREATE / UPDATE DEAL
  // =====================================================

  const handleDealSubmit = async (data: DealFormData) => {
    setSaving(true);

    const payload = {
      deal_name: data.dealName.trim(),

      associated_lead: Number(data.associatedLead),

      deal_stage: data.dealStage,

      deal_owner: data.dealOwner
        .map(Number)
        .filter((id) => Number.isFinite(id)),

      close_date: data.closeDate ? data.closeDate.format("YYYY-MM-DD") : "",

      priority: data.priority,
    };

    try {
      // =================================================
      // UPDATE DEAL
      // =================================================

      if (editingDeal) {
        await dispatch(
          updateDeal({
            id: editingDeal.id,
            data: payload,
          }),
        ).unwrap();

        setSnackbarSeverity("success");

        setSnackbarMessage("Deal updated successfully.");
      }

      // =================================================
      // CREATE DEAL
      // =================================================
      else {
        await dispatch(createDeal(payload)).unwrap();

        setSnackbarSeverity("success");

        setSnackbarMessage("Deal created successfully.");
      }

      // =================================================
      // CLOSE DRAWER
      // =================================================

      setOpenCreateDeal(false);

      setEditingDeal(null);

      // =================================================
      // REFRESH DEALS
      // =================================================

      dispatch(
        fetchDeals({
          page,
          pageSize,
          search,
          deal_owner: dealOwnerFilter || undefined,
          deal_stage: dealStageFilter || undefined,
          close_date: closeDateFilter
            ? closeDateFilter.format("YYYY-MM-DD")
            : undefined,
        }),
      );
    } catch (error) {
      console.warn("Failed to save deal:", error);

      setSnackbarSeverity("error");

      setSnackbarMessage(
        getApiErrorMessage(error, "Unable to save this deal."),
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE REQUEST
  // =====================================================

  const handleDeleteDeal = (deal: Deal) => {
    setDealToDelete(deal);
  };

  // =====================================================
  // CANCEL DELETE
  // =====================================================

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDealToDelete(null);
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!dealToDelete) {
      return;
    }

    setDeleting(true);

    try {
      await dispatch(deleteDeal(dealToDelete.id)).unwrap();

      // ===============================================
      // SUCCESS SNACKBAR
      // ===============================================

      setSnackbarSeverity("success");

      setSnackbarMessage("Deal deleted successfully.");

      // ===============================================
      // CLOSE CONFIRMATION
      // ===============================================

      setDealToDelete(null);

      // ===============================================
      // REFRESH DEALS
      // ===============================================

      dispatch(
        fetchDeals({
          page,
          pageSize,
          search,
          deal_owner: dealOwnerFilter || undefined,
          deal_stage: dealStageFilter || undefined,
          close_date: closeDateFilter
            ? closeDateFilter.format("YYYY-MM-DD")
            : undefined,
        }),
      );
    } catch (error) {
      console.warn("Failed to delete deal:", error);

      // ===============================================
      // ERROR SNACKBAR
      // ===============================================

      setSnackbarSeverity("error");

      setSnackbarMessage(
        getApiErrorMessage(error, "Unable to delete this deal."),
      );

      // ===============================================
      // CLOSE CONFIRMATION
      // ===============================================

      setDealToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          PAGE
      ================================================= */}

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
          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            title="Deals"
            createLabel="Create"
            onCreate={() => {
              setEditingDeal(null);

              setOpenCreateDeal(true);
            }}
            onImport={() => {
              setOpenImportDeal(true);
            }}
          />

          <Divider
            sx={{
              my: 1,
              mx: -2,
            }}
          />

          {/* =================================================
              SEARCH + PAGINATION
          ================================================= */}

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
              placeholder="Search name, phone, city"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

                setPage(1);
              }}
            />

            <PaginationBar
              page={page}
              count={Math.max(1, Math.ceil(count / pageSize))}
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

          {/* =================================================
              FILTERS
          ================================================= */}

          <Box
            sx={{
              my: 1,
            }}
          >
            <DealsFilters
              dealOwner={dealOwnerFilter}
              dealStage={dealStageFilter}
              closeDate={closeDateFilter}
              onDealOwnerChange={(value) => {
                setDealOwnerFilter(value);

                setPage(1);
              }}
              onDealStageChange={(value) => {
                setDealStageFilter(value);

                setPage(1);
              }}
              onCloseDateChange={(value) => {
                setCloseDateFilter(value);

                setPage(1);
              }}
            />
          </Box>

          {/* =================================================
              TABLE
          ================================================= */}

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
                  p: 2,
                }}
              >
                Loading deals...
              </Box>
            ) : error ? (
              <Box
                sx={{
                  p: 2,
                  color: "error.main",
                }}
              >
                {error}
              </Box>
            ) : (
              <DealsTable
                data={deals}
                onDelete={handleDeleteDeal}
                onEdit={(deal) => {
                  setEditingDeal(deal);

                  setOpenCreateDeal(true);
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* =====================================================
          CREATE / EDIT DEAL DRAWER
      ===================================================== */}

      <CommonDrawer
        open={openCreateDeal}
        title={editingDeal ? "Edit Deal" : "Create Deal"}
        loading={saving}
        onClose={() => {
          if (!saving) {
            setOpenCreateDeal(false);

            setEditingDeal(null);
          }
        }}
        onSave={() => {
          dealFormRef.current?.submitForm();
        }}
      >
        <DealForm
          key={editingDeal?.id ?? "create"}
          ref={dealFormRef}
          initialDeal={editingDeal}
          onSubmit={handleDealSubmit}
        />
      </CommonDrawer>
      {/* =====================================================
    IMPORT DEALS
===================================================== */}

      <ImportDrawer
        open={openImportDeal}
        onClose={() => {
          setOpenImportDeal(false);
        }}
        onSuccess={() => {
          setOpenImportDeal(false);

          dispatch(
            fetchDeals({
              page,
              pageSize,
              search,
              deal_owner: dealOwnerFilter || undefined,
              deal_stage: dealStageFilter || undefined,
              close_date: closeDateFilter
                ? closeDateFilter.format("YYYY-MM-DD")
                : undefined,
            }),
          );
        }}
        title="Import Deals"
        endpoint="/deals/import/"
        description="Upload a CSV file containing deal information."
        requiredColumns="deal_name, associated_lead, deal_stage, amount, deal_owner, close_date, priority"
        example="ABC Enterprise Deal, john.doe@example.com, Proposal Sent, 250000, admin@gmail.com, 2026-09-30, High"
        entityName="deals"
      />
      {/* =====================================================
          DELETE CONFIRMATION
          SAME THEME AS LEADS
      ===================================================== */}

      <ConfirmationDialog
        open={Boolean(dealToDelete)}
        title="Delete Deal"
        message={
          dealToDelete
            ? `Are you sure you want to delete "${dealToDelete.deal_name}"?`
            : "Are you sure you want to delete this deal?"
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
        open={Boolean(snackbarMessage)}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setSnackbarMessage("")}
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
