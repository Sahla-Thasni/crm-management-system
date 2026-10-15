"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { Box, Grid, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

import FormTextField from "@/components/form/FormTextField";
import FormSelect from "@/components/form/FormSelect";
import FormDatePicker from "@/components/form/FormDatePicker";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { Deal } from "@/store/slices/dealsSlice";

// ============================================================
// FORM DATA TYPE
// ============================================================

export type DealFormData = {
  dealName: string;
  dealStage: string;
  associatedLead: string;

  // Amount is calculated automatically from Lead products
  amount: string;

  // Multiple Deal Owners
  dealOwner: string[];

  closeDate: Dayjs | null;
  priority: string;
};

// ============================================================
// FORM REF
// ============================================================

export type DealFormRef = {
  submitForm: () => void;
};

// ============================================================
// PROPS
// ============================================================

type DealFormProps = {
  compact?: boolean;
  initialDeal?: Deal | null;
  onSubmit?: (data: DealFormData) => void;
};

// ============================================================
// EMPTY FORM
// ============================================================

const emptyFormData: DealFormData = {
  dealName: "",
  dealStage: "",
  associatedLead: "",
  amount: "",
  dealOwner: [],
  closeDate: null,
  priority: "",
};

// ============================================================
// COMPONENT
// ============================================================

const DealForm = forwardRef<DealFormRef, DealFormProps>(function DealForm(
  { compact = false, initialDeal = null, onSubmit },
  ref,
) {
  const theme = useTheme();

  // ========================================================
  // REDUX DATA
  // ========================================================

  const leads = useSelector((state: RootState) => state.leads.leads);

  const users = useSelector((state: RootState) => state.users.users);

  // ========================================================
  // FORM STATE
  // ========================================================

  const [formData, setFormData] = useState<DealFormData>(emptyFormData);

  // ========================================================
  // EDIT / CREATE PREFILL
  // ========================================================

  useEffect(() => {
    // CREATE MODE
    if (!initialDeal) {
      setFormData(emptyFormData);
      return;
    }

    // EDIT MODE
    setFormData({
      dealName: initialDeal.deal_name ?? "",

      dealStage: initialDeal.deal_stage ?? "",

      associatedLead: String(initialDeal.associated_lead ?? ""),

      amount: String(initialDeal.amount ?? ""),

      // --------------------------------------------
      // Multiple Deal Owners
      // --------------------------------------------
      dealOwner: Array.isArray(initialDeal.deal_owner)
        ? initialDeal.deal_owner.map(String)
        : [],

      closeDate: initialDeal.close_date ? dayjs(initialDeal.close_date) : null,

      priority: initialDeal.priority ?? "",
    });
  }, [initialDeal]);

  // ========================================================
  // CALCULATE DEAL AMOUNT FROM LEAD PRODUCTS
  // ========================================================

  useEffect(() => {
    // No Lead selected
    if (!formData.associatedLead) {
      setFormData((previous) => ({
        ...previous,
        amount: "",
      }));

      return;
    }

    // Find selected Lead
    const selectedLead = leads.find(
      (lead) => String(lead.id) === formData.associatedLead,
    );

    // Lead is not loaded yet
    if (!selectedLead) {
      return;
    }

    // Calculate total product price
    const calculatedAmount =
      selectedLead.product_details?.reduce(
        (total, product) => total + Number(product.unit_price || 0),
        0,
      ) ?? 0;

    // Update amount
    setFormData((previous) => ({
      ...previous,
      amount: calculatedAmount.toFixed(2),
    }));
  }, [formData.associatedLead, leads]);

  // ========================================================
  // HANDLE FIELD CHANGE
  // ========================================================

  const handleChange = (
    field: keyof DealFormData,
    value: string | string[] | Dayjs | null,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ========================================================
  // SUBMIT FORM
  // ========================================================

  const submitForm = () => {
    onSubmit?.(formData);
  };

  // ========================================================
  // EXPOSE submitForm TO PARENT
  // ========================================================

  useImperativeHandle(
    ref,
    () => ({
      submitForm,
    }),
    [formData, onSubmit],
  );

  // ========================================================
  // STYLES
  // ========================================================

  const gap = compact ? 1 : 1.5;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      height: 44,
      borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
    },
  };

  // ========================================================
  // CALCULATED AMOUNT FOR DISPLAY
  // ========================================================

  const displayAmount = formData.amount
    ? Number(formData.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        submitForm();
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {/* ==================================================
            DEAL NAME
        ================================================== */}

      <FormTextField
        label="Deal Name"
        required
        placeholder="Enter"
        fullWidth
        size="small"
        sx={fieldSx}
        value={formData.dealName}
        onChange={(event) => handleChange("dealName", event.target.value)}
      />

      {/* ==================================================
            DEAL STAGE
        ================================================== */}

      <FormSelect
        label="Deal Stage"
        required
        placeholder="Choose"
        value={formData.dealStage}
        onChange={(value) => {
          if (typeof value === "string") {
            handleChange("dealStage", value);
          }
        }}
        options={[
          {
            label: "Proposal Sent",
            value: "Proposal Sent",
          },
          {
            label: "Negotiation",
            value: "Negotiation",
          },
          {
            label: "Closed Won",
            value: "Closed Won",
          },
          {
            label: "Closed Lost",
            value: "Closed Lost",
          },
        ]}
      />

      {/* ==================================================
            ASSOCIATED LEAD
        ================================================== */}

      <FormSelect
        label="Associated Lead"
        required
        placeholder="Choose"
        value={formData.associatedLead}
        onChange={(value) => {
          if (typeof value === "string") {
            handleChange("associatedLead", value);
          }
        }}
        options={leads.map((lead) => ({
          label: `${lead.first_name} ${lead.last_name}`,
          value: String(lead.id),
          secondaryLabel: lead.email,
        }))}
      />

      {/* ==================================================
            AMOUNT
            Automatically calculated from Lead products
        ================================================== */}

      <FormTextField
        label="Amount"
        required
        placeholder="Automatically calculated"
        fullWidth
        size="small"
        type="text"
        sx={fieldSx}
        value={displayAmount}
      />

      {/* ==================================================
            DEAL OWNER - MULTIPLE SELECTION
        ================================================== */}

      <FormSelect
        label="Deal Owner"
        required
        multiple
        placeholder="Choose"
        value={formData.dealOwner}
        onChange={(value) => {
          const selectedOwners = Array.isArray(value) ? value.map(String) : [];

          handleChange("dealOwner", selectedOwners);
        }}
        options={users.map((user) => ({
          label: `${user.first_name} ${user.last_name}`,
          value: String(user.id),
          secondaryLabel: user.email,
        }))}
      />

      {/* ==================================================
            CLOSE DATE + PRIORITY
        ================================================== */}

      <Grid container spacing={2}>
        {/* CLOSE DATE */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            label="Close Date"
            required
            value={formData.closeDate}
            onChange={(value) => handleChange("closeDate", value)}
          />
        </Grid>

        {/* PRIORITY */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            label="Priority"
            required
            placeholder="Choose"
            value={formData.priority}
            onChange={(value) => {
              if (typeof value === "string") {
                handleChange("priority", value);
              }
            }}
            options={[
              {
                label: "High",
                value: "High",
              },
              {
                label: "Medium",
                value: "Medium",
              },
              {
                label: "Low",
                value: "Low",
              },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// ============================================================
// DISPLAY NAME
// ============================================================

DealForm.displayName = "DealForm";

// ============================================================
// EXPORT
// ============================================================

export default DealForm;
