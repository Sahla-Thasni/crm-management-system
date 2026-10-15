"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Divider,
  Paper,
  Snackbar,
  Stack,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";

import {
  PageHeader,
  SearchInput,
  PaginationBar,
} from "@/components/listpage/common";

import {
  CompaniesFilters,
  CompaniesTable,
} from "@/components/listpage/companies";

import CommonDrawer from "@/components/common/CommonDrawer";
import ImportDrawer from "@/components/common/ImportDrawer";
import CompanyForm from "@/components/createforms/CompanyForm";

import ConfirmationDialog from "@/components/form/ConfirmationDialog";

import { fetchCompanies } from "@/store/slices/companiesSlice";

import type {
  RootState,
  AppDispatch,
} from "@/store/store";

import { apiRequest } from "@/lib/api";

// =====================================================
// PAGE
// =====================================================

export default function CompaniesPage() {

  // =====================================================
  // REDUX
  // =====================================================

  const dispatch = useDispatch<AppDispatch>();

  const {
    companies,
    count,
    loading,
    error,
  } = useSelector(
    (state: RootState) =>
      state.companies
  );

  // =====================================================
  // CREATE DRAWER
  // =====================================================

  const [
    openCreateCompany,
    setOpenCreateCompany,
  ] = useState(false);

  // =====================================================
  // EDIT DRAWER
  // =====================================================

  const [
    openEditCompany,
    setOpenEditCompany,
  ] = useState(false);

  // =====================================================
  // IMPORT DRAWER
  // =====================================================

  const [
    openImportCompany,
    setOpenImportCompany,
  ] = useState(false);

  // =====================================================
  // SELECTED COMPANY
  // =====================================================

  const [
    selectedCompany,
    setSelectedCompany,
  ] = useState<any | null>(null);

  // =====================================================
  // DELETE CONFIRMATION
  // =====================================================

  const [
    openDeleteDialog,
    setOpenDeleteDialog,
  ] = useState(false);

  const [
    companyToDelete,
    setCompanyToDelete,
  ] = useState<any | null>(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  // =====================================================
  // SNACKBAR
  // =====================================================

  const [
    snackbarOpen,
    setSnackbarOpen,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");

  const [
    snackbarSeverity,
    setSnackbarSeverity,
  ] = useState<
    "success" | "error"
  >("success");

  const showSnackbar = (
    message: string,
    severity:
      | "success"
      | "error" = "success",
  ) => {

    setSnackbarMessage(message);

    setSnackbarSeverity(
      severity
    );

    setSnackbarOpen(true);
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const pageSize = 10;

  // =====================================================
  // SEARCH
  // =====================================================

  const [
    search,
    setSearch,
  ] = useState("");

  // =====================================================
  // INDUSTRY FILTER
  // =====================================================

  const [
    industry,
    setIndustry,
  ] = useState("");

  // =====================================================
  // CITY FILTER
  // =====================================================

  const [
    city,
    setCity,
  ] = useState("");

  // =====================================================
  // COUNTRY FILTER
  // =====================================================

  const [
    country,
    setCountry,
  ] = useState("");

  // =====================================================
  // TOTAL PAGES
  // =====================================================

  const totalPages =
    Math.ceil(
      count / pageSize
    );

  // =====================================================
  // FETCH COMPANIES
  // =====================================================

  useEffect(() => {

    dispatch(
      fetchCompanies({
        page,
        pageSize,
        search,
        industry,
        city,
        country,
      })
    );

  }, [
    dispatch,
    page,
    pageSize,
    search,
    industry,
    city,
    country,
  ]);

  // =====================================================
  // REFRESH COMPANIES
  // =====================================================

  const refreshCompanies = () => {

    dispatch(
      fetchCompanies({
        page,
        pageSize,
        search,
        industry,
        city,
        country,
      })
    );

  };

  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value =
      event.target.value;

    setSearch(value);

    setPage(1);
  };

  // =====================================================
  // INDUSTRY CHANGE
  // =====================================================

  const handleIndustryChange = (
    value: string
  ) => {

    setIndustry(value);

    setPage(1);
  };

  // =====================================================
  // CITY CHANGE
  // =====================================================

  const handleCityChange = (
    value: string
  ) => {

    setCity(value);

    setPage(1);
  };

  // =====================================================
  // COUNTRY CHANGE
  // =====================================================

  const handleCountryChange = (
    value: string
  ) => {

    setCountry(value);

    setPage(1);
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const handlePageChange = (
    newPage: number
  ) => {

    setPage(newPage);
  };

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreateCompany = () => {

    setOpenCreateCompany(true);
  };

  // =====================================================
  // CREATE SUCCESS
  // =====================================================

  const handleCompanyCreated = () => {

    setOpenCreateCompany(false);

    refreshCompanies();
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEditCompany = (
    company: any
  ) => {

    setSelectedCompany(
      company
    );

    setOpenEditCompany(true);
  };

  // =====================================================
  // EDIT SUCCESS
  // =====================================================

  const handleCompanyUpdated = () => {

    setOpenEditCompany(false);

    setSelectedCompany(null);

    refreshCompanies();
  };

  // =====================================================
  // CLOSE EDIT
  // =====================================================

  const handleCloseEditCompany = () => {

    setOpenEditCompany(false);

    setSelectedCompany(null);
  };

  // =====================================================
  // DELETE CLICK
  // =====================================================

  const handleDeleteCompany = (
    company: any
  ) => {

    setCompanyToDelete(
      company
    );

    setDeleteError("");

    setOpenDeleteDialog(true);
  };

  // =====================================================
  // CLOSE DELETE DIALOG
  // =====================================================

  const handleCloseDeleteDialog = () => {

    if (deleteLoading) {
      return;
    }

    setOpenDeleteDialog(false);

    setCompanyToDelete(null);

    setDeleteError("");
  };

  // =====================================================
  // DELETE COMPANY
  // =====================================================

  const handleConfirmDelete = async () => {

    if (!companyToDelete?.id) {
      return;
    }

    try {

      setDeleteLoading(true);

      setDeleteError("");

      await apiRequest(
        `/companies/${companyToDelete.id}/`,
        {
          method: "DELETE",
        }
      );

      // Close confirmation dialog

      setOpenDeleteDialog(false);

      setCompanyToDelete(null);

      // Success snackbar

      showSnackbar(
        "Company deleted successfully.",
        "success"
      );

      // Refresh companies

      refreshCompanies();

    } catch (error) {

      console.error(
        "Failed to delete company:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete company.";

      setDeleteError(
        message
      );

      // Error snackbar

      showSnackbar(
        message,
        "error"
      );

      // Close confirmation dialog

      setOpenDeleteDialog(false);

      setCompanyToDelete(null);

    } finally {

      setDeleteLoading(false);
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
          bgcolor:
            "background.default",
          minHeight: "100%",
          p: 1,
        }}
      >

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor:
              "background.paper",
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection:
              "column",
            border: "1px solid",
            borderColor:
              "divider",
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <PageHeader
            title="Companies"
            createLabel="Create"
            onCreate={
              handleCreateCompany
            }
            onImport={() =>
              setOpenImportCompany(
                true
              )
            }
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
              alignItems:
                "stretch",

              justifyContent: {
                lg: "space-between",
              },
            }}
          >

            <SearchInput
              placeholder="Search phone, name, city"
              value={search}
              onChange={
                handleSearchChange
              }
            />

            <PaginationBar
              page={page}
              count={Math.max(
                1,
                totalPages
              )}
              onPageChange={
                handlePageChange
              }
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

            <CompaniesFilters
              industry={industry}
              onIndustryChange={
                handleIndustryChange
              }

              city={city}
              onCityChange={
                handleCityChange
              }

              country={country}
              onCountryChange={
                handleCountryChange
              }
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
                Loading companies...
              </Box>

            ) : error ? (

              <Box
                sx={{
                  p: 2,
                  color:
                    "error.main",
                }}
              >
                {error}
              </Box>

            ) : (

              <CompaniesTable
                data={companies}
                onEdit={
                  handleEditCompany
                }
                onDelete={
                  handleDeleteCompany
                }
              />

            )}

          </Box>

        </Paper>

      </Box>

      {/* =================================================
          CREATE COMPANY DRAWER
      ================================================= */}

      <CommonDrawer
        open={
          openCreateCompany
        }
        title="Create Company"
        onClose={() => {
          setOpenCreateCompany(
            false
          );
        }}
        onSave={() => {

          const form =
            document.getElementById(
              "company-create-form"
            ) as
              | HTMLFormElement
              | null;

          form?.requestSubmit();
        }}
        saveText="Save"
      >

        <CompanyForm
          formId="company-create-form"
          onSuccess={
            handleCompanyCreated
          }
        />

      </CommonDrawer>

      {/* =================================================
          EDIT COMPANY DRAWER
      ================================================= */}

      <CommonDrawer
        open={
          openEditCompany
        }
        title="Edit Company"
        onClose={
          handleCloseEditCompany
        }
        onSave={() => {

          const form =
            document.getElementById(
              "company-edit-form"
            ) as
              | HTMLFormElement
              | null;

          form?.requestSubmit();
        }}
        saveText="Save"
      >

        {selectedCompany && (

          <CompanyForm
            company={
              selectedCompany
            }
            formId="company-edit-form"
            onSuccess={
              handleCompanyUpdated
            }
          />

        )}

      </CommonDrawer>

      {/* =================================================
          IMPORT COMPANY DRAWER
      ================================================= */}

      <ImportDrawer
        open={
          openImportCompany
        }

        onClose={() =>
          setOpenImportCompany(
            false
          )
        }

        onSuccess={() => {

          // Close import drawer

          setOpenImportCompany(
            false
          );

          // Refresh companies using
          // the CURRENT page, search
          // and filters.

          dispatch(
            fetchCompanies({
              page,
              pageSize,
              search,
              industry,
              city,
              country,
            })
          );
        }}

        title="Import Companies"

        endpoint="/companies/import/"

        description={
          "Upload a CSV file containing company information."
        }

        requiredColumns={
          "company_name, domain_name, email, phone_number, company_owner, industry, company_type, city, country, number_of_employees, annual_revenue"
        }

        example={
          "Blue Horizon Technologies, bluehorizon.com, contact@bluehorizon.com, 9876500011, 2, 1, 1, Kochi, India, 45, 3500000"
        }

        entityName="companies"
      />

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      <ConfirmationDialog
        open={
          openDeleteDialog
        }

        title="Delete Company"

        message={
          companyToDelete
            ? `Are you sure you want to delete "${companyToDelete.company_name}"?`
            : "Are you sure you want to delete this company?"
        }

        onClose={
          handleCloseDeleteDialog
        }

        onConfirm={
          handleConfirmDelete
        }

        confirmText={
          deleteLoading
            ? "Deleting..."
            : "Delete"
        }

        cancelText="Cancel"
      />

      {/* =================================================
          SNACKBAR
      ================================================= */}

      <Snackbar
        open={
          snackbarOpen
        }

        autoHideDuration={
          3000
        }

        onClose={() =>
          setSnackbarOpen(
            false
          )
        }

        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          onClose={() =>
            setSnackbarOpen(
              false
            )
          }

          severity={
            snackbarSeverity
          }

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