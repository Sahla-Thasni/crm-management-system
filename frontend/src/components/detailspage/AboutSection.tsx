"use client";

import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";

import { AboutSectionProps } from "@/types/detailspage/about";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import ConfirmationDialog from "@/components/form/ConfirmationDialog";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useEffect, useState } from "react";

export default function AboutSection({
  title,
  data,
  onSave,
}: AboutSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [formData, setFormData] = useState(data);
  const [originalData, setOriginalData] = useState(data);

  // Keep component data in sync with parent/API data
  useEffect(() => {
    setFormData(data);
    setOriginalData(data);
  }, [data]);

  const handleEdit = () => {
    setOriginalData([...formData]);
    setIsEditing(true);
  };

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      await onSave?.(formData);

      setOriginalData([...formData]);
      setIsEditing(false);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleCancelSave = () => {
    setFormData([...originalData]);
    setIsEditing(false);
    setConfirmOpen(false);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        onClick={() => setExpanded(!expanded)}
        sx={{
          px: 2.5,
          py: 1.5,
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <KeyboardArrowDownRoundedIcon
            sx={{
              color: "primary.main",
              fontSize: 18,
              transform: expanded
                ? "rotate(0deg)"
                : "rotate(-90deg)",
              transition: "transform 0.2s ease",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {expanded &&
          (isEditing ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              sx={{
                color: "primary.main",
              }}
            >
              <SaveOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ) : (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              sx={{
                color: "primary.main",
              }}
            >
              <BorderColorOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ))}
      </Stack>

      {/* Content */}
      {expanded && (
        <Box
          sx={{
            px: 2.5,
            py: 2.5,
          }}
        >
          <Stack spacing={2.5}>
            {formData.map((item, index) => (
              <Box key={item.label}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  {item.label}
                </Typography>

                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={item.value ?? ""}
                    disabled={item.readOnly}
                    onChange={(e) => {
                      const updated = [...formData];

                      updated[index] = {
                        ...updated[index],
                        value: e.target.value,
                      };

                      setFormData(updated);
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {item.value ?? "-"}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        title="Save Changes"
        message="Are you sure you want to save the changes?"
        onClose={handleCancelSave}
        onConfirm={handleConfirmSave}
      />
    </Box>
  );
}