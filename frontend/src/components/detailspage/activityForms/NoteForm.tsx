"use client";

import { useState } from "react";
import Grid from "@mui/material/Grid";

import ActivityModal from "./ActivityModal";
import { NoteFormData, NoteFormProps } from "./types";

import { RichTextEditor } from "@/components/form";

const initialState: NoteFormData = {
  title: "",
  relatedTo: "",
  notes: "",
};

export default function NoteForm({
  open,
  onClose,
  onSave,
}: NoteFormProps) {
  const [formData, setFormData] =
    useState<NoteFormData>(initialState);

  const handleSave = () => {
    console.log("NOTE FORM DATA:", formData);

    onSave?.(formData);
  };

  return (
    <ActivityModal
      open={open}
      title="Create Note"
      variant="drawer"
      onClose={onClose}
      onSave={handleSave}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <RichTextEditor
            required
            label="Note"
            placeholder="Enter"
            value={formData.notes}
            onChange={(value) =>
              setFormData({
                ...formData,
                notes: value,
              })
            }
          />
        </Grid>
      </Grid>
    </ActivityModal>
  );
}