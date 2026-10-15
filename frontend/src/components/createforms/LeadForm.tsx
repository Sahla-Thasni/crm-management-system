"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  InputAdornment,
  useTheme,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import { useDispatch, useSelector } from "react-redux";

import FormTextField from "@/components/form/FormTextField";
import FormSelect from "@/components/form/FormSelect";
import { PhoneField } from "@/components/form";

import ConfirmationDialog from "@/components/form/ConfirmationDialog";

import type {
  RootState,
  AppDispatch,
} from "@/store/store";

import {
  fetchUsers,
} from "@/store/slices/usersSlice";

import {
  setSelectedUserIds,
} from "@/store/slices/selectionSlice";

import {
  createLead,
  fetchLeads,
  updateLead,
} from "@/store/slices/leadsSlice";

import {
  fetchProducts,
} from "@/store/slices/productsSlice";

import {
  fetchCompanies,
} from "@/store/slices/companiesSlice";

import type {
  Lead,
} from "@/store/slices/leadsSlice";

/* =========================================================
   COUNTRIES
========================================================= */

const countries = [
  {
    code: "IN",
    flag: "https://flagcdn.com/w40/in.png",
  },
  {
    code: "AE",
    flag: "https://flagcdn.com/w40/ae.png",
  },
  {
    code: "US",
    flag: "https://flagcdn.com/w40/us.png",
  },
];

/* =========================================================
   PROPS
========================================================= */

type LeadFormProps = {
  compact?: boolean;

  // Existing lead when editing
  lead?: Lead | null;

  // Called after successful create/update
  onSuccess?: () => void;

  // Used by CommonDrawer Save button
  formId?: string;
};

/* =========================================================
   FORM DATA
========================================================= */

interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  contactOwner: number[];
  leadStatus: string;
  products: string[];
  company: string;
  city: string;
}

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm: LeadFormData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  jobTitle: "",
  contactOwner: [],
  leadStatus: "",
  products: [],
  company: "",
  city: "",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function LeadForm({
  compact = false,
  lead = null,
  onSuccess,
  formId = "lead-form",
}: LeadFormProps) {
  const theme = useTheme();

  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(lead?.id);

  /* =======================================================
     COUNTRY
  ======================================================= */

  const [country, setCountry] = useState("IN");

  /* =======================================================
     REDUX - PRODUCTS
  ======================================================= */

  const products = useSelector(
    (state: RootState) =>
      state.products.products
  );

  const productsLoading = useSelector(
    (state: RootState) =>
      state.products.loading
  );

  /* =======================================================
     REDUX - COMPANIES
  ======================================================= */

  const companies = useSelector(
    (state: RootState) =>
      state.companies.companies
  );

  const companiesLoading = useSelector(
    (state: RootState) =>
      state.companies.loading
  );

  /* =======================================================
     REDUX - USERS
  ======================================================= */

  const users = useSelector(
    (state: RootState) =>
      state.users.users
  );

  const usersLoading = useSelector(
    (state: RootState) =>
      state.users.loading
  );

  const usersError = useSelector(
    (state: RootState) =>
      state.users.error
  );

  /* =======================================================
     REDUX - LEADS
  ======================================================= */

  const leadLoading = useSelector(
    (state: RootState) =>
      state.leads.loading
  );

  const leadError = useSelector(
    (state: RootState) =>
      state.leads.error
  );

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [formData, setFormData] =
    useState<LeadFormData>(emptyForm);

  /* =======================================================
     VALIDATION ERRORS
  ======================================================= */

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  /* =======================================================
     UPDATE CONFIRMATION
  ======================================================= */

  const [openUpdateConfirm, setOpenUpdateConfirm] =
    useState(false);

  const [updateSaving, setUpdateSaving] =
    useState(false);

  /* =======================================================
     LOAD DROPDOWN DATA
  ======================================================= */

  useEffect(() => {
    dispatch(fetchUsers());

    dispatch(fetchProducts());

    dispatch(
      fetchCompanies({
        page: 1,
        pageSize: 100,
      })
    );
  }, [dispatch]);

  /* =======================================================
     PREFILL FORM WHEN EDITING
  ======================================================= */

  useEffect(() => {
    if (!lead) {
      setFormData({
        ...emptyForm,
      });

      setErrors({});

      dispatch(
        setSelectedUserIds([])
      );

      return;
    }

    const contactOwnerIds =
      Array.isArray(lead.contact_owner)
        ? lead.contact_owner.map(Number)
        : [];

    setFormData({
      email:
        lead.email ?? "",

      firstName:
        lead.first_name ?? "",

      lastName:
        lead.last_name ?? "",

      phone:
        lead.phone_number ?? "",

      jobTitle:
        lead.job_title ?? "",

      contactOwner:
        contactOwnerIds,

      leadStatus:
        lead.lead_status ?? "",

      products:
        Array.isArray(lead.products)
          ? lead.products.map(String)
          : [],

      company:
        lead.company !== null &&
        lead.company !== undefined
          ? String(lead.company)
          : "",

      city:
        lead.city ?? "",
    });

    // Clear old validation errors when opening/editing a lead
    setErrors({});

    dispatch(
      setSelectedUserIds(
        contactOwnerIds
      )
    );
  }, [lead, dispatch]);

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    /* ---------------- EMAIL ---------------- */

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    /* ---------------- FIRST NAME ---------------- */

    if (!formData.firstName.trim()) {
      newErrors.firstName =
        "First Name is required";
    }

    /* ---------------- LAST NAME ---------------- */

    if (!formData.lastName.trim()) {
      newErrors.lastName =
        "Last Name is required";
    }

    /* ---------------- PHONE ---------------- */

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone Number is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =======================================================
     HANDLE TEXT CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof LeadFormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Remove validation error once user starts correcting field
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  /* =======================================================
     CONTACT OWNER OPTIONS
  ======================================================= */

  const contactOwnerOptions =
    users.map((user) => ({
      label:
        `${user.first_name} ${user.last_name}`.trim() ||
        user.email,

      value: String(user.id),

      secondaryLabel:
        user.email,
    }));

  /* =======================================================
     CREATE / UPDATE PAYLOAD
  ======================================================= */

  const buildPayload = () => {
    return {
      email:
        formData.email.trim(),

      first_name:
        formData.firstName.trim(),

      last_name:
        formData.lastName.trim(),

      phone_number:
        formData.phone.trim(),

      job_title:
        formData.jobTitle.trim(),

      contact_owner:
        formData.contactOwner,

      products:
        formData.products
          .map(Number)
          .filter((id) =>
            Number.isFinite(id)
          ),

      company:
        formData.company
          ? Number(formData.company)
          : null,

      city:
        formData.city.trim(),

      lead_status:
        formData.leadStatus,

      lead_date:
        lead?.lead_date ??
        new Date()
          .toISOString()
          .split("T")[0],
    };
  };

  /* =======================================================
     CREATE LEAD
  ======================================================= */

  const handleCreate = async () => {
    try {
      const payload =
        buildPayload();

      console.log(
        "Creating lead payload:",
        payload
      );

      const result =
        await dispatch(
          createLead(payload)
        ).unwrap();

      console.log(
        "Lead created successfully:",
        result
      );

      setFormData({
        ...emptyForm,
      });

      setErrors({});

      dispatch(
        setSelectedUserIds([])
      );

      await dispatch(
        fetchLeads()
      );

      onSuccess?.();

    } catch (error) {
      console.error(
        "Failed to create lead:",
        error
      );
    }
  };

  /* =======================================================
     UPDATE CONFIRMATION
  ======================================================= */

  const handleUpdateClick = () => {
    if (!lead?.id || updateSaving) {
      return;
    }

    setOpenUpdateConfirm(true);
  };

  /* =======================================================
     CANCEL UPDATE CONFIRMATION
  ======================================================= */

  const handleCancelUpdate = () => {
    if (updateSaving) {
      return;
    }

    setOpenUpdateConfirm(false);
  };

  /* =======================================================
     CONFIRM UPDATE
  ======================================================= */

  const handleConfirmUpdate = async () => {
    if (!lead?.id || updateSaving) {
      return;
    }

    try {
      setUpdateSaving(true);

      const payload =
        buildPayload();

      console.log(
        "Updating lead:",
        lead.id
      );

      console.log(
        "Update payload:",
        payload
      );

      const result =
        await dispatch(
          updateLead({
            id: lead.id,
            payload,
          })
        ).unwrap();

      console.log(
        "Lead updated successfully:",
        result
      );

      setOpenUpdateConfirm(false);

      setErrors({});

      await dispatch(
        fetchLeads()
      );

      onSuccess?.();

    } catch (error) {
      console.error(
        "Failed to update lead:",
        error
      );
    } finally {
      setUpdateSaving(false);
    }
  };

  /* =======================================================
     SAVE / SUBMIT

     CommonDrawer Save button triggers this form.

     CREATE:
       Save → Validate → Create API

     EDIT:
       Save → Validate → Confirmation → Update API
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /* =====================================================
       VALIDATE BEFORE ANY API CALL
    ===================================================== */

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    /* =====================================================
       EDIT MODE
    ===================================================== */

    if (isEditMode) {
      handleUpdateClick();
      return;
    }

    /* =====================================================
       CREATE MODE
    ===================================================== */

    await handleCreate();
  };

  /* =======================================================
     FIELD STYLE
  ======================================================= */

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 44,
      borderRadius: 2,
      backgroundColor:
        theme.palette.background.paper,
    },

    "& .MuiInputBase-input": {
      paddingLeft: "8px",
    },
  };

  const gap =
    compact ? 1 : 1.5;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <Box
        component="form"
        id={formId}
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap,
        }}
      >

        {/* =================================================
            EMAIL
        ================================================= */}

        <FormTextField
          label="Email"
          placeholder="Enter"
          required
          fullWidth
          size="small"
          type="email"
          sx={fieldSx}
          value={formData.email}
          error={Boolean(errors.email)}
          helperText={errors.email}
          onChange={(e) =>
            handleChange(
              "email",
              e.target.value
            )
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color:
                        "text.secondary",
                    }}
                  >
                    <EmailOutlinedIcon
                      fontSize="small"
                    />

                    <Box
                      component="span"
                      sx={{
                        color: "divider",
                      }}
                    >
                      |
                    </Box>
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* =================================================
            FIRST NAME
        ================================================= */}

        <FormTextField
          label="First Name"
          placeholder="Enter"
          required
          fullWidth
          size="small"
          sx={fieldSx}
          value={formData.firstName}
          error={Boolean(
            errors.firstName
          )}
          helperText={
            errors.firstName
          }
          onChange={(e) =>
            handleChange(
              "firstName",
              e.target.value
            )
          }
        />

        {/* =================================================
            LAST NAME
        ================================================= */}

        <FormTextField
          label="Last Name"
          placeholder="Enter"
          required
          fullWidth
          size="small"
          sx={fieldSx}
          value={formData.lastName}
          error={Boolean(
            errors.lastName
          )}
          helperText={
            errors.lastName
          }
          onChange={(e) =>
            handleChange(
              "lastName",
              e.target.value
            )
          }
        />

        {/* =================================================
            PHONE
        ================================================= */}

        <PhoneField
          required
          country={country}
          phone={formData.phone}
          countries={countries}
          onCountryChange={setCountry}
          onPhoneChange={(value) =>
            handleChange(
              "phone",
              value
            )
          }
        />

        {/* PHONE ERROR */}

        {errors.phone && (
          <Box
            sx={{
              color: "error.main",
              fontSize: 12,
              mt: -1,
            }}
          >
            {errors.phone}
          </Box>
        )}

        {/* =================================================
            JOB TITLE
        ================================================= */}

        <FormTextField
          label="Job Title"
          placeholder="Enter"
          fullWidth
          size="small"
          sx={fieldSx}
          value={formData.jobTitle}
          onChange={(e) =>
            handleChange(
              "jobTitle",
              e.target.value
            )
          }
        />

        {/* =================================================
            CONTACT OWNER
        ================================================= */}

        <FormSelect
          label="Contact Owner"
          value={formData.contactOwner.map(
            String
          )}
          multiple
          placeholder={
            usersLoading
              ? "Loading users..."
              : "Choose"
          }
          options={
            contactOwnerOptions
          }
          onChange={(value) => {
            const selectedValues =
              Array.isArray(value)
                ? value
                : [];

            const selectedUserIds =
              selectedValues.map(Number);

            setFormData((prev) => ({
              ...prev,
              contactOwner:
                selectedUserIds,
            }));

            dispatch(
              setSelectedUserIds(
                selectedUserIds
              )
            );
          }}
        />

        {/* USERS ERROR */}

        {usersError && (
          <Box
            sx={{
              fontSize: 12,
              color: "error.main",
              mt: -0.5,
            }}
          >
            {usersError}
          </Box>
        )}

        {/* =================================================
            LEAD STATUS
        ================================================= */}

        <FormSelect
          label="Lead Status"
          placeholder="Choose"
          options={[
            {
              label: "New",
              value: "New",
            },
            {
              label: "Contacted",
              value: "Contacted",
            },
            {
              label: "Qualified",
              value: "Qualified",
            },
            {
              label: "Converted",
              value: "Converted",
            },
          ]}
          value={
            formData.leadStatus
          }
          onChange={(value) =>
            handleChange(
              "leadStatus",
              String(value)
            )
          }
        />

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <FormSelect
          label="Products"
          multiple
          placeholder={
            productsLoading
              ? "Loading products..."
              : "Choose"
          }
          options={products.map(
            (product) => ({
              label:
                product.name,
              value:
                String(product.id),
            })
          )}
          value={
            formData.products
          }
          onChange={(value) => {
            const selectedProducts =
              Array.isArray(value)
                ? value.map(String)
                : [];

            setFormData(
              (previous) => ({
                ...previous,
                products:
                  selectedProducts,
              })
            );
          }}
        />

        {/* =================================================
            COMPANY
        ================================================= */}

        <FormSelect
          label="Company"
          placeholder={
            companiesLoading
              ? "Loading companies..."
              : "Choose"
          }
          options={companies.map(
            (company) => ({
              label:
                company.company_name,
              value:
                String(company.id),
            })
          )}
          value={
            formData.company
          }
          onChange={(value) =>
            handleChange(
              "company",
              String(value)
            )
          }
        />

        {/* =================================================
            CITY
        ================================================= */}

        <FormSelect
          label="City"
          placeholder="Choose"
          options={[
            {
              label: "Dubai",
              value: "dubai",
            },
            {
              label: "Abu Dhabi",
              value: "abudhabi",
            },
            {
              label: "Sharjah",
              value: "sharjah",
            },
          ]}
          value={
            formData.city
          }
          onChange={(value) =>
            handleChange(
              "city",
              String(value)
            )
          }
        />

        {/* =================================================
            API ERROR
        ================================================= */}

        {leadError && (
          <Box
            sx={{
              color: "error.main",
              fontSize: 13,
              mt: 0.5,
            }}
          >
            {leadError}
          </Box>
        )}

      </Box>

      {/* =====================================================
          UPDATE CONFIRMATION
      ===================================================== */}

      <ConfirmationDialog
        open={openUpdateConfirm}
        title="Confirm Update"
        message="Are you sure you want to update this lead?"
        onClose={handleCancelUpdate}
        onConfirm={
          handleConfirmUpdate
        }
        confirmText={
          updateSaving
            ? "Updating..."
            : "Update"
        }
        cancelText="Cancel"
      />
    </>
  );
}