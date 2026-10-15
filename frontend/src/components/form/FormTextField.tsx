"use client";

import { Box, TextField, Typography, TextFieldProps } from "@mui/material";

interface FormTextFieldProps extends Omit<TextFieldProps, "label"> {
  label?: string;
  required?: boolean;
}

export default function FormTextField({
  label,
  required = false,
  placeholder,
  ...props
}: FormTextFieldProps) {
  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {label}
          {required && (
            <Box
              component="span"
              sx={{
                color: "error.main",
                ml: 0.3,
              }}
            >
              *
            </Box>
          )}
        </Typography>
      )}

      <TextField
        fullWidth
        size={props.multiline ? "medium" : "small"}
        variant="outlined"
        placeholder={placeholder}
        {...props}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,

            ...(props.multiline
              ? {
                  alignItems: "flex-start",
                  minHeight: 100,
                }
              : {
                  height: 44,
                }),
          },

          "& .MuiInputBase-inputMultiline": {
            padding: "12px 14px",
          },

          ...props.sx,
        }}
      />
    </Box>
  );
}
