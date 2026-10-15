"use client";

import {
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ActionButtons({
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
    >
      {/* EDIT */}

      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* DELETE */}

      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}