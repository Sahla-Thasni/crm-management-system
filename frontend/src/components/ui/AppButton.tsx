"use client";

import { Button, ButtonProps, CircularProgress } from "@mui/material";
import { ReactNode } from "react";

interface AppButtonProps extends ButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export default function AppButton({
  children,
  loading = false,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      sx={{
        height: 44,
        borderRadius: 2,
        fontWeight: 550,
        textTransform: "none",
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
