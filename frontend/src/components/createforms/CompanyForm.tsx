"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

import FormTextField from "@/components/form/FormTextField";
import FormSelect from "@/components/form/FormSelect";
import { PhoneField } from "@/components/form";

import { apiRequest } from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

type CompanyFormProps = {
  compact?: boolean;
  company?: any | null;
  formId?: string;
  onSuccess?: () => void;
};

interface Industry {
  id: number;
  name: string;
  is_active: boolean;
}

interface CompanyType {
  id: number;
  name: string;
  is_active: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface CompanyFormData {
  domainName: string;
  companyName: string;
  companyOwner: string[];
  industry: string;
  type: string;
  city: string;
  countryRegion: string;
  employees: string;
  annualRevenue: string;
  phone: string;
  email: string;
}

// =====================================================
// COUNTRIES
// =====================================================

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

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm: CompanyFormData = {
  domainName: "",
  companyName: "",
  companyOwner: [],
  industry: "",
  type: "",
  city: "",
  countryRegion: "",
  employees: "",
  annualRevenue: "",
  phone: "",
  email: "",
};

// =====================================================
// COMPONENT
// =====================================================

export default function CompanyForm({
  compact = false,
  company = null,
  formId = "company-form",
  onSuccess,
}: CompanyFormProps) {
  const theme = useTheme();

  // =====================================================
  // OPTIONS
  // =====================================================

  const [industries, setIndustries] =
    useState<Industry[]>([]);

  const [companyTypes, setCompanyTypes] =
    useState<CompanyType[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [country, setCountry] = useState("IN");

  const [formData, setFormData] =
    useState<CompanyFormData>(emptyForm);

  // =====================================================
  // VALIDATION
  // =====================================================

  const [errors, setErrors] = useState({
    domainName: "",
    companyName: "",
    companyOwner: "",
    industry: "",
    type: "",
    phone: "",
    email: "",
    employees: "",
    annualRevenue: "",
  });

  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // LOAD OPTIONS
  // =====================================================

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [
          industryResponse,
          companyTypeResponse,
          usersResponse,
        ] = await Promise.all([
          apiRequest<{
            results: Industry[];
          }>("/companies/industries/"),

          apiRequest<{
            results: CompanyType[];
          }>("/companies/company-types/"),

          apiRequest<{
            results: User[];
          }>("/users/list/"),
        ]);

        setIndustries(
          industryResponse.results
        );

        setCompanyTypes(
          companyTypeResponse.results
        );

        setUsers(
          usersResponse.results
        );
      } catch (error) {
        console.error(
          "Failed to load company form options:",
          error
        );

        setServerError(
          error instanceof Error
            ? error.message
            : "Failed to load form options."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // =====================================================
  // LOAD COMPANY FOR EDIT
  // =====================================================

  useEffect(() => {
    if (!company) {
      setFormData({
        ...emptyForm,
      });

      setErrors({
        domainName: "",
        companyName: "",
        companyOwner: "",
        industry: "",
        type: "",
        phone: "",
        email: "",
        employees: "",
        annualRevenue: "",
      });

      setServerError("");

      return;
    }

    setFormData({
      domainName:
        company.domain_name ?? "",

      companyName:
        company.company_name ?? "",

      // Multiple company owners
      companyOwner:
        Array.isArray(company.company_owner)
          ? company.company_owner.map(String)
          : [],

      industry:
        company.industry != null
          ? String(company.industry)
          : "",

      type:
        company.company_type != null
          ? String(company.company_type)
          : "",

      city:
        company.city ?? "",

      countryRegion:
        company.country ?? "",

      employees:
        company.number_of_employees != null
          ? String(company.number_of_employees)
          : "",

      annualRevenue:
        company.annual_revenue != null
          ? String(company.annual_revenue)
          : "",

      phone:
        company.phone_number ?? "",

      email:
        company.email ?? "",
    });

    setErrors({
      domainName: "",
      companyName: "",
      companyOwner: "",
      industry: "",
      type: "",
      phone: "",
      email: "",
      employees: "",
      annualRevenue: "",
    });

    setServerError("");
  }, [company]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    field: keyof CompanyFormData,
    value: string | string[]
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]:
        field in previous
          ? ""
          : previous[
              field as keyof typeof previous
            ],
    }));

    setServerError("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {
      domainName: "",
      companyName: "",
      companyOwner: "",
      industry: "",
      type: "",
      phone: "",
      email: "",
      employees: "",
      annualRevenue: "",
    };

    let valid = true;

    // Domain Name
    if (!formData.domainName.trim()) {
      newErrors.domainName =
        "Domain Name is required.";
      valid = false;
    }

    // Company Name
    if (!formData.companyName.trim()) {
      newErrors.companyName =
        "Company Name is required.";
      valid = false;
    }

    // Company Owner
    if (
      !Array.isArray(formData.companyOwner) ||
      formData.companyOwner.length === 0
    ) {
      newErrors.companyOwner =
        "Company Owner is required.";
      valid = false;
    }

    // Industry
    if (!formData.industry) {
      newErrors.industry =
        "Industry is required.";
      valid = false;
    }

    // Company Type
    if (!formData.type) {
      newErrors.type =
        "Company Type is required.";
      valid = false;
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
      valid = false;
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required.";

      valid = false;
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim()
        )
      ) {
        newErrors.email =
          "Enter a valid email address.";

        valid = false;
      }
    }

    // Employees
    if (formData.employees) {
      const employees =
        Number(formData.employees);

      if (
        !Number.isInteger(employees) ||
        employees < 0
      ) {
        newErrors.employees =
          "Enter a valid number of employees.";

        valid = false;
      }
    }

    // Annual Revenue
    if (formData.annualRevenue) {
      const revenue =
        Number(formData.annualRevenue);

      if (
        Number.isNaN(revenue) ||
        revenue < 0
      ) {
        newErrors.annualRevenue =
          "Enter a valid annual revenue.";

        valid = false;
      }
    }

    setErrors(newErrors);

    return valid;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const valid = validateForm();

    if (!valid) {
      return;
    }

    try {
      setSubmitting(true);
      setServerError("");

      const payload = {
        domain_name:
          formData.domainName.trim(),

        company_name:
          formData.companyName.trim(),

        // Multiple company owners
        company_owner:
          formData.companyOwner
            .map(Number)
            .filter((id) =>
              Number.isFinite(id)
            ),

        industry:
          Number(formData.industry),

        company_type:
          Number(formData.type),

        city:
          formData.city.trim(),

        country:
          formData.countryRegion.trim(),

        number_of_employees:
          formData.employees
            ? Number(formData.employees)
            : null,

        annual_revenue:
          formData.annualRevenue.trim()
            ? formData.annualRevenue.trim()
            : null,

        phone_number:
          formData.phone.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),
      };

      // =================================================
      // CREATE
      // =================================================

      if (!company?.id) {
        await apiRequest(
          "/companies/",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      // =================================================
      // EDIT
      // =================================================

      else {
        await apiRequest(
          `/companies/${company.id}/`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      onSuccess?.();
    } catch (error) {
      console.error(
        "Failed to save company:",
        error
      );

      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to save company."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // OPTIONS FOR SELECTS
  // =====================================================

  const industryOptions =
    industries.map((industry) => ({
      label: industry.name,
      value: String(industry.id),
    }));

  const companyTypeOptions =
    companyTypes.map((type) => ({
      label: type.name,
      value: String(type.id),
    }));

  const userOptions =
    users.map((user) => {
      const fullName =
        `${user.first_name ?? ""} ${
          user.last_name ?? ""
        }`.trim();

      return {
        label:
          fullName || user.email,

        secondaryLabel:
          user.email,

        value:
          String(user.id),
      };
    });

  // =====================================================
  // STYLES
  // =====================================================

  const gap =
    compact ? 1 : 1.5;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      height: 44,
      borderRadius: 2,
      backgroundColor:
        theme.palette.background.paper,
    },
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
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
          SERVER ERROR
      ================================================= */}

      {serverError && (
        <Typography
          color="error"
          sx={{
            fontSize: 14,
          }}
        >
          {serverError}
        </Typography>
      )}

      {/* =================================================
          DOMAIN NAME
      ================================================= */}

      <FormTextField
        label="Domain Name"
        required
        placeholder="Enter"
        fullWidth
        size="small"
        sx={fieldSx}
        value={formData.domainName}
        onChange={(e) =>
          handleChange(
            "domainName",
            e.target.value
          )
        }
        error={Boolean(
          errors.domainName
        )}
        helperText={
          errors.domainName
        }
      />

      {/* =================================================
          COMPANY NAME
      ================================================= */}

      <FormTextField
        label="Company Name"
        required
        placeholder="Enter"
        fullWidth
        size="small"
        sx={fieldSx}
        value={formData.companyName}
        onChange={(e) =>
          handleChange(
            "companyName",
            e.target.value
          )
        }
        error={Boolean(
          errors.companyName
        )}
        helperText={
          errors.companyName
        }
      />

      {/* =================================================
          COMPANY OWNER - MULTIPLE SELECT
      ================================================= */}

      <FormSelect
        label="Company Owner"
        required
        multiple
        placeholder={
          loadingOptions
            ? "Loading..."
            : "Choose"
        }
        value={formData.companyOwner}
        onChange={(value) => {
          const selectedOwners =
            Array.isArray(value)
              ? value.map(String)
              : [];

          handleChange(
            "companyOwner",
            selectedOwners
          );
        }}
        options={userOptions}
      />

      {errors.companyOwner && (
        <Typography
          color="error"
          sx={{
            fontSize: 12,
            mt: -1,
          }}
        >
          {errors.companyOwner}
        </Typography>
      )}

      {/* =================================================
          INDUSTRY + TYPE
      ================================================= */}

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
            label="Industry"
            required
            placeholder={
              loadingOptions
                ? "Loading..."
                : "Choose"
            }
            value={formData.industry}
            onChange={(value) =>
              handleChange(
                "industry",
                Array.isArray(value)
                  ? value[0] ?? ""
                  : value
              )
            }
            options={industryOptions}
          />

          {errors.industry && (
            <Typography
              color="error"
              sx={{
                fontSize: 12,
                mt: 0.5,
              }}
            >
              {errors.industry}
            </Typography>
          )}
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <FormSelect
            label="Type"
            required
            placeholder={
              loadingOptions
                ? "Loading..."
                : "Choose"
            }
            value={formData.type}
            onChange={(value) =>
              handleChange(
                "type",
                Array.isArray(value)
                  ? value[0] ?? ""
                  : value
              )
            }
            options={companyTypeOptions}
          />

          {errors.type && (
            <Typography
              color="error"
              sx={{
                fontSize: 12,
                mt: 0.5,
              }}
            >
              {errors.type}
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* =================================================
          CITY + COUNTRY
      ================================================= */}

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
          <FormTextField
            label="City"
            placeholder="Enter"
            fullWidth
            size="small"
            sx={fieldSx}
            value={formData.city}
            onChange={(e) =>
              handleChange(
                "city",
                e.target.value
              )
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <FormTextField
            label="Country/Region"
            placeholder="Enter"
            fullWidth
            size="small"
            sx={fieldSx}
            value={
              formData.countryRegion
            }
            onChange={(e) =>
              handleChange(
                "countryRegion",
                e.target.value
              )
            }
          />
        </Grid>
      </Grid>

      {/* =================================================
          EMPLOYEES + REVENUE
      ================================================= */}

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
          <FormTextField
            label="No of Employees"
            placeholder="Enter"
            fullWidth
            size="small"
            sx={fieldSx}
            value={
              formData.employees
            }
            onChange={(e) =>
              handleChange(
                "employees",
                e.target.value
              )
            }
            error={Boolean(
              errors.employees
            )}
            helperText={
              errors.employees
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <FormTextField
            label="Annual Revenue"
            placeholder="Enter"
            fullWidth
            size="small"
            sx={fieldSx}
            value={
              formData.annualRevenue
            }
            onChange={(e) =>
              handleChange(
                "annualRevenue",
                e.target.value
              )
            }
            error={Boolean(
              errors.annualRevenue
            )}
            helperText={
              errors.annualRevenue
            }
          />
        </Grid>
      </Grid>

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

      {errors.phone && (
        <Typography
          color="error"
          sx={{
            fontSize: 12,
            mt: -1,
          }}
        >
          {errors.phone}
        </Typography>
      )}

      {/* =================================================
          EMAIL
      ================================================= */}

      <FormTextField
        label="Email"
        required
        placeholder="Enter"
        fullWidth
        size="small"
        type="email"
        sx={fieldSx}
        value={formData.email}
        onChange={(e) =>
          handleChange(
            "email",
            e.target.value
          )
        }
        error={Boolean(errors.email)}
        helperText={errors.email}
      />
    </Box>
  );
}