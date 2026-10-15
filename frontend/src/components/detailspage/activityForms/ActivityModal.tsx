"use client";

import { ReactNode } from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface ActivityModalProps {
  open: boolean;
  title: string;
  children: ReactNode;

  onClose: () => void;
  onSave?: () => void;

  variant?: "drawer" | "dialog";

  paperSx?: SxProps<Theme>;

  titleSx?: SxProps<Theme>;

  hideFooter?: boolean;

  saveText?: string;
  cancelText?: string;

  loading?: boolean;
}

export default function ActivityModal({
  open,
  title,
  children,
  onClose,
  onSave,

  variant = "drawer",

  paperSx,
  titleSx,

  hideFooter = false,

  saveText = "Save",
  cancelText = "Cancel",

  loading = false,
}: ActivityModalProps) {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
      keepMounted
      maxWidth={false}
      fullWidth={variant === "dialog"}
      slotProps={{
        paper: {
          sx: {
            ...(variant === "drawer"
              ? {
                position: "fixed",
                top: 0,
                right: 0,
                m: 0,
                width: {
                  xs: "100%",
                  sm: 420,
                  md: 507,
                },
                height: "100vh",
                maxHeight: "100vh",
                borderRadius: 0,
              }
              : {
                width: {
                  xs: "95vw",
                  sm: 520,
                  md: 560,
                },
                maxWidth: "95vw",
                borderRadius: {
                  xs: 1,
                  sm: 2,
                },
                m: "auto",
              }),

            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: 24,

            ...paperSx,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          minHeight: 64,
          px: {
            xs: 2,
            sm: 3,
          },
          fontSize: {
            xs: 18,
            sm: 20,
          },
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          fontWeight: 600,
          ...titleSx,
        }}
      >
        {title}

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          p: {
            xs: 2,
            sm: 3,
          },
          overflowY: "auto",
        }}
      >
        {children}
      </DialogContent>

      {!hideFooter && (
        <DialogActions
          sx={{
            borderTop: 1,
            borderColor: "divider",
            p: {
              xs: 2,
              sm: 3,
            },
            gap: 2,
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          }}
        >
          <Button fullWidth variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={onSave}
            disabled={loading}
          >
            {saveText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
