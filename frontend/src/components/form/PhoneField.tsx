"use client";

import { Box, MenuItem, Select, Typography, useTheme } from "@mui/material";
import FormTextField from "./FormTextField";

export type CountryOption = {
  code: string;
  flag: string;
};

type PhoneFieldProps = {
  label?: string;
  required?: boolean;
  country: string;
  phone: string;
  countries: CountryOption[];
  onCountryChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export default function PhoneField({
  label = "Phone Number",
  required = false,
  country,
  phone,
  countries,
  onCountryChange,
  onPhoneChange,
}: PhoneFieldProps) {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: 14,
          mb: 0.8,
          color: theme.palette.text.primary,
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: theme.palette.error.main,
              marginLeft: 2,
            }}
          >
            *
          </span>
        )}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
        }}
      >
        <Select
          value={country}
          size="small"
          onChange={(e) => onCountryChange(e.target.value)}
          sx={{
            width: 90,
            flexShrink: 0,

            "& .MuiOutlinedInput-root": {
              height: 44,
              borderRadius: 2,
            },
          }}
          renderValue={(selected) => {
            const selectedCountry = countries.find((c) => c.code === selected);

            return (
              <img
                src={selectedCountry?.flag}
                alt={selected}
                width={22}
                height={16}
              />
            );
          }}
        >
          {countries.map((item) => (
            <MenuItem key={item.code} value={item.code}>
              <img src={item.flag} alt={item.code} width={22} height={16} />
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ flex: 1 }}>
          <FormTextField
            fullWidth
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                height: 40,
              },
            }}
            placeholder="Enter phone number"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            label={""}
          />
        </Box>
      </Box>
    </Box>
  );
}
