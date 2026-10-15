"use client";

import AppButton from "@/components/ui/AppButton";
import {
  Stack,
  Typography,
} from "@mui/material";

interface PageHeaderProps {
  title: string;

  onCreate?: () => void;

  createLabel?: string;

  onImport?: () => void;
}

export default function PageHeader({
  title,
  onCreate,
  onImport,
  createLabel = "Create",
}: PageHeaderProps) {

  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      sx={{
        justifyContent: "space-between",

        alignItems: {
          xs: "flex-start",
          sm: "center",
        },

        mb: 1,
        px: 2,
      }}
      spacing={1}
    >

      {/* =====================================================
          TITLE
      ===================================================== */}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: {
            xs: "100%",
            sm: "auto",
          },
        }}
      >

        {/* =================================================
            IMPORT
        ================================================= */}

        <AppButton
          variant="outlined"
          size="small"
          onClick={onImport}
          sx={{
            width: 134,
            minWidth: 134,
            height: 44,
            borderRadius: "12px",
            fontSize: 14,
            fontWeight: 600,
            textTransform: "none",
            px: 0,
            flex: {
              xs: 1,
              sm: "unset",
            },
          }}
        >
          Import
        </AppButton>

        {/* =================================================
            CREATE
        ================================================= */}

        <AppButton
          variant="contained"
          onClick={onCreate}
          sx={{
            width: 134,
            minWidth: 134,
            height: 44,
            borderRadius: "12px",
            fontSize: 14,
            fontWeight: 600,
            textTransform: "none",
            px: 0,
            boxShadow: "none",

            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {createLabel}
        </AppButton>

      </Stack>
    </Stack>
  );
}