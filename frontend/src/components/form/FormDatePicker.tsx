"use client";

import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

interface FormDatePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  required?: boolean;
}

export default function FormDatePicker({
  label,
  value,
  onChange,
  required = false,
}: FormDatePickerProps) {
  return (
    <Box>
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

      <DatePicker
        value={value}
        onChange={onChange}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            sx: {
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: 2,
              },
            },
          },
        }}
      />
    </Box>
  );
}
