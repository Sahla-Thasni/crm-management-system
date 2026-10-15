"use client";

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type User = {
  id: number;
  first_name: string;
  last_name: string;
};

interface TicketsFiltersProps {
  ticketStatus: string;
  ticketOwner: string;
  priority: string;

  users: User[];

  onTicketStatusChange: (value: string) => void;
  onTicketOwnerChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export default function TicketsFilters({
  ticketStatus,
  ticketOwner,
  priority,
  users,
  onTicketStatusChange,
  onTicketOwnerChange,
  onPriorityChange,
}: TicketsFiltersProps) {
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
      {/* ==================== TICKET OWNER ==================== */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>Ticket Owner</InputLabel>

        <Select
          label="Ticket Owner"
          value={ticketOwner}
          onChange={(event) => {
            onTicketOwnerChange(event.target.value);
          }}
        >
          <MenuItem value="">All</MenuItem>

          {users.map((user) => (
            <MenuItem key={user.id} value={String(user.id)}>
              {user.first_name} {user.last_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ==================== TICKET STATUS ==================== */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>Ticket Status</InputLabel>

        <Select
          label="Ticket Status"
          value={ticketStatus}
          onChange={(event) => {
            onTicketStatusChange(event.target.value);
          }}
        >
          <MenuItem value="">All</MenuItem>

          <MenuItem value="New">New</MenuItem>

          <MenuItem value="Open">Open</MenuItem>

          <MenuItem value="Waiting on us">Waiting on us</MenuItem>

          <MenuItem value="Waiting on contact">Waiting on contact</MenuItem>

          <MenuItem value="Closed">Closed</MenuItem>
        </Select>
      </FormControl>

      {/* ==================== SOURCE ==================== */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>Source</InputLabel>

        <Select label="Source" defaultValue="">
          <MenuItem value="">All</MenuItem>

          <MenuItem value="Email">Email</MenuItem>

          <MenuItem value="Phone">Phone</MenuItem>

          <MenuItem value="Chat">Chat</MenuItem>
        </Select>
      </FormControl>

      {/* ==================== PRIORITY ==================== */}

      <FormControl
        size="small"
        sx={{
          minWidth: 160,
        }}
      >
        <InputLabel>Priority</InputLabel>

        <Select
          label="Priority"
          value={priority}
          onChange={(event) => {
            onPriorityChange(event.target.value);
          }}
        >
          <MenuItem value="">All</MenuItem>

          <MenuItem value="Low">Low</MenuItem>

          <MenuItem value="Medium">Medium</MenuItem>

          <MenuItem value="High">High</MenuItem>

          <MenuItem value="Critical">Critical</MenuItem>
        </Select>
      </FormControl>

      {/* ==================== CREATED DATE ==================== */}

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
