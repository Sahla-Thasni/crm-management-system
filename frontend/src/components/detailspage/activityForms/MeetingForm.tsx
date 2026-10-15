"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";

import ActivityModal from "./ActivityModal";
import { MeetingFormData, MeetingFormProps, MeetingUser, } from "./types";
import { apiRequest } from "@/lib/api";

import {
  FormTextField,
  FormDatePicker,
  FormTimePicker,
  FormMultiSelect,
  FormSelect,
  RichTextEditor,
} from "@/components/form";

const initialState: MeetingFormData = {
  meetingTitle: "",
  startDate: null,
  startTime: null,
  endTime: null,
  attendees: [],
  location: "",
  reminder: "",
  notes: "",
};

export default function MeetingForm({
  open,
  onClose,
  onSave,
  contactOwnerIds = [],
}: MeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>(initialState);
  const [users, setUsers] = useState<MeetingUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiRequest("/users/list/", {
          method: "GET",
        });

        const data = response as
          | MeetingUser[]
          | { results: MeetingUser[] };

        const allUsers = Array.isArray(data)
          ? data
          : data.results ?? [];

        const filteredUsers = allUsers.filter((user) =>
          contactOwnerIds.includes(Number(user.id)) ||
          user.is_superuser === true
        );

        setUsers(filteredUsers);

      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleSave = () => {
    console.log(formData);

    onSave?.(formData);

    setFormData(initialState);

    onClose();
  };

  return (
    <ActivityModal
      open={open}
      title="Schedule Meeting"
      variant="drawer"
      onClose={onClose}
      onSave={handleSave}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Title"
            required
            placeholder="Enter"
            value={formData.meetingTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                meetingTitle: e.target.value,
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormDatePicker
            required
            label="Start Date"
            value={formData.startDate}
            onChange={(value) =>
              setFormData({
                ...formData,
                startDate: value,
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormTimePicker
            required
            label="Start Time"
            value={formData.startTime}
            onChange={(value) =>
              setFormData({
                ...formData,
                startTime: value,
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormTimePicker
            required
            label="End Time"
            value={formData.endTime}
            onChange={(value) =>
              setFormData({
                ...formData,
                endTime: value,
              })
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSelect
            label="Attendees"
            value={formData.attendees.map(String)}
            multiple
            placeholder="Choose"
            options={users.map((user) => ({
              label:
                `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                user.email,
              value: String(user.id),
            }))}
            onChange={(value) => {
              const selectedValues = Array.isArray(value)
                ? value
                : [];

              setFormData((prev) => ({
                ...prev,
                attendees: selectedValues.map(String),
              }));
            }}
          />

        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSelect
            label="Location"
            value={formData.location}
            onChange={(value) =>
              setFormData({
                ...formData,
                location: Array.isArray(value) ? value[0] ?? "" : value,
              })
            }
            options={[
              { label: "Office", value: "Office" },
              { label: "Google Meet", value: "Google Meet" },
              { label: "Zoom", value: "Zoom" },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSelect
            label="Reminder"
            value={formData.reminder}
            onChange={(value) =>
              setFormData({
                ...formData,
                reminder: Array.isArray(value) ? value[0] ?? "" : value,
              })
            }
            options={[
              {
                label: "None",
                value: "none",
              },
              {
                label: "5 Minutes Before",
                value: "5_minutes",
              },
              {
                label: "15 Minutes Before",
                value: "15_minutes",
              },
              {
                label: "30 Minutes Before",
                value: "30_minutes",
              },
              {
                label: "1 Hour Before",
                value: "1_hour",
              },
              {
                label: "1 Day Before",
                value: "1_day",
              },
            ]}
          />
        </Grid>

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
