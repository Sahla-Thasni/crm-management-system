"use client";
import { Box, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";

interface FormTimePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  required?: boolean;
}

export default function FormTimePicker({
  label,
  value,
  onChange,
  required = false,
}: FormTimePickerProps) {
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

      <TimePicker
        value={value}
        onChange={onChange}
        format="hh:mm A"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            sx: {
              "& .MuiOutlinedInput-root": {
                height: 44,
                borderRadius: 2,
              },
            },
          },
        }}
      />
    </Box>
  );
}
