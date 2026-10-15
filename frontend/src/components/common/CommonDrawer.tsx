"use client";

import { ReactNode } from "react";

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import AppButton from "@/components/ui/AppButton";


type CommonDrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;

  onClose: () => void;
  onSave: () => void;

  loading?: boolean;
  saveText?: string;
};


export default function CommonDrawer({
  open,
  title,
  children,
  onClose,
  onSave,
  loading = false,
  saveText = "Save",
}: CommonDrawerProps) {

  return (
    <Drawer
      anchor="right"
      open={open}

      // =====================================================
      // PREVENT OUTSIDE CLICK / ESCAPE FROM CLOSING DRAWER
      // =====================================================

      onClose={(_event, reason) => {
        if (
          reason === "backdropClick" ||
          reason === "escapeKeyDown"
        ) {
          return;
        }

        onClose();
      }}

      slotProps={{
        paper: {
          sx: {
            width: {
              xs: "90%",
              sm: 420,
              md: 420,
            },

            maxWidth: 420,

            top: {
              xs: "136px",
              md: "72px",
            },

            height: {
              xs: "calc(100% - 136px)",
              md: "calc(100% - 72px)",
            },

            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          },
        },
      }}
    >

      <Box
        sx={{
          width: "100%",
          height: "100%",

          display: "flex",
          flexDirection: "column",

          bgcolor: "background.paper",
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <Box
          sx={{
            px: 2,
            py: 2,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>


          {/* CLOSE BUTTON */}

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>

        </Box>


        <Divider />


        {/* =====================================================
            BODY
        ===================================================== */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",

            px: 2,
            py: 2,
          }}
        >
          {children}
        </Box>


        <Divider />


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <Box
          sx={{
            px: 2,
            py: 2,

            display: "flex",

            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },

            gap: 2,

            justifyContent: "flex-end",
          }}
        >

          {/* CANCEL */}

          <AppButton
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{
              flex: 1,

              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            Cancel
          </AppButton>


          {/* SAVE */}

          <AppButton
            variant="contained"
            loading={loading}
            onClick={onSave}
            sx={{
              flex: 1,

              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            {saveText}
          </AppButton>

        </Box>

      </Box>

    </Drawer>
  );
}