"use client";

import {
  Box,
  MenuItem,
  TextField,
  Typography,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";

interface Option {
  label: string;
  value: string;
  secondaryLabel?: string;
}

interface FormSelectProps {
  label: string;
  value: string | string[];
  options: Option[];
  onChange: (value: string | string[]) => void;
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
}

export default function FormSelect({
  label,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Choose",
  multiple = false,
}: FormSelectProps) {
  return (
    <Box>
      {/* Label */}
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
          <Typography
            component="span"
            color="error"
            sx={{ ml: 0.3 }}
          >
            *
          </Typography>
        )}
      </Typography>

      <TextField
        select
        fullWidth
        size="small"
        value={value}
        onChange={(e) => {
          if (multiple) {
            const selectedValue = e.target.value;

            const values =
              typeof selectedValue === "string"
                ? selectedValue.split(",")
                : selectedValue;

            onChange(values);
          } else {
            onChange(e.target.value);
          }
        }}
        slotProps={{
          select: {
            multiple,

            displayEmpty: true,

            renderValue: (selected) => {
              /*
               * MULTIPLE SELECT
               */
              if (multiple) {
                const selectedValues = Array.isArray(selected)
                  ? selected.map(String)
                  : [];

                if (selectedValues.length === 0) {
                  return (
                    <Typography color="text.secondary">
                      {placeholder}
                    </Typography>
                  );
                }

                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.7,
                      alignItems: "center",
                    }}
                  >
                    {selectedValues.map((selectedValue) => {
                      const option = options.find(
                        (item) => item.value === selectedValue
                      );

                      if (!option) return null;

                      return (
                        <Chip
                          key={selectedValue}
                          label={option.label}
                          size="small"
                          sx={{
                            height: 30,
                            borderRadius: 1.5,
                            backgroundColor: "#F1F1F1",
                            color: "#222",
                            fontSize: "14px",
                            fontWeight: 500,

                            "& .MuiChip-label": {
                              px: 1.2,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              }

              /*
               * SINGLE SELECT
               */
              if (!selected) {
                return (
                  <Typography color="text.secondary">
                    {placeholder}
                  </Typography>
                );
              }

              const option = options.find(
                (item) => item.value === String(selected)
              );

              return option?.label || String(selected);
            },
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            minHeight: 44,
          },

          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            py: 0.8,
          },
        }}
      >
        {/* Placeholder */}
        {!multiple && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}

        {/* Options */}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              alignItems: "flex-start",
              py: 1.2,

              /*
               * Highlight selected owner
               */
              ...(multiple &&
                Array.isArray(value) &&
                value.includes(option.value)
                ? {
                  backgroundColor: "#F3F0FF",

                  "&:hover": {
                    backgroundColor: "#EAE5FF",
                  },

                  "&.Mui-selected": {
                    backgroundColor: "#F3F0FF",
                  },

                  "&.Mui-selected:hover": {
                    backgroundColor: "#EAE5FF",
                  },
                }
                : {}),
            }}
          >
            {/* Checkbox */}
            {multiple && (
              <Checkbox
                checked={
                  Array.isArray(value) &&
                  value.includes(option.value)
                }
                sx={{
                  p: 0.5,
                  mr: 1,
                }}
              />
            )}

            {/* Name + Email */}
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1F2937",
                  }}
                >
                  {option.label}
                </Typography>
              }
              secondary={
                option.secondaryLabel ? (
                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      mt: 0.3,
                      fontSize: "13px",
                      color: "#7A7A7A",
                    }}
                  >
                    {option.secondaryLabel}
                  </Typography>
                ) : null
              }
            />
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}