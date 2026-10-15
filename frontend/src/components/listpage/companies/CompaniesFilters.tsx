"use client";

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// =====================================================
// PROPS
// =====================================================

interface CompaniesFiltersProps {
  industry: string;
  onIndustryChange: (value: string) => void;

  city: string;
  onCityChange: (value: string) => void;

  country: string;
  onCountryChange: (value: string) => void;
}

// =====================================================
// COMPONENT
// =====================================================

export default function CompaniesFilters({
  industry,
  onIndustryChange,
  city,
  onCityChange,
  country,
  onCountryChange,
}: CompaniesFiltersProps) {
  return (
    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      spacing={1}
      sx={{
        mb: 0.5,
      }}
    >
      {/* =================================================
          INDUSTRY TYPE
      ================================================= */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>
          Industry Type
        </InputLabel>

        <Select
          label="Industry Type"
          value={industry}
          onChange={(event) => {
            onIndustryChange(
              event.target.value
            );
          }}
        >
          {/* ALL */}

          <MenuItem value="">
            All
          </MenuItem>

          {/* INDUSTRIES */}

          <MenuItem value="1">
            IT
          </MenuItem>

          <MenuItem value="2">
            Health Care
          </MenuItem>

          <MenuItem value="3">
            Finance
          </MenuItem>

          <MenuItem value="4">
            Education
          </MenuItem>

          <MenuItem value="5">
            Manufacturing
          </MenuItem>

          <MenuItem value="6">
            Real Estate
          </MenuItem>
        </Select>
      </FormControl>

      {/* =================================================
          CITY
      ================================================= */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>
          City
        </InputLabel>

        <Select
          label="City"
          value={city}
          onChange={(event) => {
            onCityChange(
              event.target.value
            );
          }}
        >
          {/* ALL */}

          <MenuItem value="">
            All
          </MenuItem>

          {/* CITIES */}

          <MenuItem value="Kochi">
            Kochi
          </MenuItem>

          <MenuItem value="Kollam">
            Kollam
          </MenuItem>

          <MenuItem value="Dubai">
            Dubai
          </MenuItem>

          <MenuItem value="Toronto">
            Toronto
          </MenuItem>

          <MenuItem value="London">
            London
          </MenuItem>
        </Select>
      </FormControl>

      {/* =================================================
          COUNTRY / REGION
      ================================================= */}

      <FormControl
        size="small"
        sx={{
          minWidth: 170,
        }}
      >
        <InputLabel>
          Country/Region
        </InputLabel>

        <Select
          label="Country/Region"
          value={country}
          onChange={(event) => {
            onCountryChange(event.target.value);
          }}
        >
          <MenuItem value="">
            All
          </MenuItem>

          <MenuItem value="India">
            India
          </MenuItem>

          <MenuItem value="UAE">
            UAE
          </MenuItem>

          <MenuItem value="Canada">
            Canada
          </MenuItem>

          <MenuItem value="UK">
            UK
          </MenuItem>
        </Select>
      </FormControl>

      {/* =================================================
          LEAD STATUS
          NOT CONNECTED YET
      ================================================= */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>
          Lead Status
        </InputLabel>

        <Select
          label="Lead Status"
          defaultValue=""
        >
          <MenuItem value="">
            All
          </MenuItem>

          <MenuItem value="true">
            Active
          </MenuItem>

          <MenuItem value="false">
            Inactive
          </MenuItem>
        </Select>
      </FormControl>

      {/* =================================================
          CREATED DATE
          NOT CONNECTED YET
      ================================================= */}

      <DatePicker
        label="Created Date"
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            sx: {
              width: 160,
            },
          },
        }}
      />
    </Stack>
  );
}