"use client";

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface LeadsFiltersProps {
  leadStatus: string;
  onLeadStatusChange: (value: string) => void;
  createdDate: any;
  onCreatedDateChange: (value: any) => void;
}

export default function LeadsFilters({
  leadStatus,
  onLeadStatusChange,
  createdDate,
  onCreatedDateChange,
}: LeadsFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1}
      sx={{ mb: 0.5 }}
    >
      {/* Lead Status Dropdown */}

      <FormControl
        size="small"
        sx={{ minWidth: 200 }}
      >
        <InputLabel>Lead Status</InputLabel>

        <Select
          label="Lead Status"
          value={leadStatus}
          onChange={(event) =>
            onLeadStatusChange(
              event.target.value
            )
          }
          size="small"
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="">
            All
          </MenuItem>

          <MenuItem value="New">
            New
          </MenuItem>

          <MenuItem value="Contacted">
            Contacted
          </MenuItem>

          <MenuItem value="Qualified">
            Qualified
          </MenuItem>

          <MenuItem value="Converted">
            Convetred
          </MenuItem>

        </Select>
      </FormControl>

      <DatePicker
        label="Created Date"
        value={createdDate ?? null}
        onChange={onCreatedDateChange}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            sx: { width: 160 },
          },
        }}
      />
    </Stack>
  );
}