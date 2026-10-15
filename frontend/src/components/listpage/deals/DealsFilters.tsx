"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

type Props = {
  dealOwner: string;
  dealStage: string;
  closeDate: Dayjs | null;
  onDealOwnerChange: (value: string) => void;
  onDealStageChange: (value: string) => void;
  onCloseDateChange: (value: Dayjs | null) => void;
};

export default function DealsFilters({
  dealOwner,
  dealStage,
  closeDate,
  onDealOwnerChange,
  onDealStageChange,
  onCloseDateChange,
}: Props) {
  const users = useSelector((state: RootState) => state.users.users);

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 0.5 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Deal Owner</InputLabel>

        <Select
          label="Deal Owner"
          value={dealOwner}
          onChange={(event) => onDealOwnerChange(event.target.value)}
        >
          <MenuItem value="">All</MenuItem>

          {users.map((user) => (
            <MenuItem key={user.id} value={String(user.id)}>
              {user.first_name} {user.last_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Deal Stage</InputLabel>

        <Select
          label="Deal Stage"
          value={dealStage}
          onChange={(event) => onDealStageChange(event.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Proposal Sent">Proposal Sent</MenuItem>
          <MenuItem value="Negotiation">Negotiation</MenuItem>
          <MenuItem value="Closed Won">Closed Won</MenuItem>
          <MenuItem value="Closed Lost">Closed Lost</MenuItem>
        </Select>
      </FormControl>

      <DatePicker
        label="Close Date"
        value={closeDate}
        onChange={onCloseDateChange}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            sx: { width: 160 },
          },
        }}
      />
      <DatePicker
        label="Created Date"
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
