"use client";

import {
  Box,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface FormMultiSelectProps {
  label: string;
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
  required?: boolean;
  placeholder?: string;
}

export default function FormMultiSelect({
  label,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Choose",
}: FormMultiSelectProps) {
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
          <Typography component="span" color="error" sx={{ ml: 0.3 }}>
            *
          </Typography>
        )}
      </Typography>

     <TextField
  select
  fullWidth
  size="small"
  value={value}
  slotProps={{
    select: {
      multiple: true,
      renderValue: (selected) =>
        (selected as string[]).length
          ? (selected as string[]).join(", ")
          : placeholder,
    },
  }}
  onChange={(e) =>
    onChange(
      typeof e.target.value === "string"
        ? e.target.value.split(",")
        : (e.target.value as string[])
    )
  }
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      minHeight: 44,
    },
  }}
>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={value.includes(option.value)} />

            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}