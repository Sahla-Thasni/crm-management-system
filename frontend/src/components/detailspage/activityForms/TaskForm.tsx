"use client";



import Grid from "@mui/material/Grid";

import ActivityModal from "./ActivityModal";
import { TaskFormData, TaskFormProps } from "./types";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import { fetchUsers } from "@/store/slices/usersSlice";
import dayjs from "dayjs";
import {
  FormDatePicker,
  FormMultiSelect,
  FormSelect,
  FormTextField,
  FormTimePicker,
  RichTextEditor,
} from "@/components/form";

const initialState: TaskFormData = {
  taskName: "",
  dueDate: "",
  dueTime: "",
  time: null,
  taskType: "",
  priority: "",
  assignedTo: [],
  notes: "",
  title: "",
};

export default function TaskForm({
  open,
  onClose,
  onSave,
  contactOwnerIds = [],
}: TaskFormProps) {
  const [formData, setFormData] =
    useState<TaskFormData>(initialState);

  const dispatch = useDispatch<AppDispatch>();

  const users = useSelector(
    (state: RootState) => state.users.users
  );

  const filteredUsers = users.filter(
    (user) =>
      contactOwnerIds.includes(Number(user.id)) ||
      user.is_superuser === true
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSave = () => {
    onSave?.(formData);

    setFormData(initialState);

    onClose();
  };
  console.log("TASK CONTACT OWNER IDS:", contactOwnerIds);
  console.log("ALL USERS:", users);
  console.log("FILTERED USERS:", filteredUsers);

  return (
    <ActivityModal
      open={open}
      title="Create Task"
      variant="drawer"
      onClose={onClose}
      onSave={handleSave}
    >
      <Grid container spacing={1}>
        {/* Task Name */}

        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Task Name"
            required
            placeholder="Enter"
            value={formData.taskName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                taskName: e.target.value,
              }))
            }
          />
        </Grid>

        {/* Due Date */}

        <Grid size={{ xs: 6 }}>
          <FormDatePicker
            label="Due Date"
            required
            value={formData.dueDate ? dayjs(formData.dueDate) : null}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                dueDate: value ? value.format("YYYY-MM-DD") : "",
              }));
            }}
          />
        </Grid>

        {/* Time */}

        <Grid size={{ xs: 6 }}>
          <FormTimePicker
            label="Time"
            required
            value={formData.time}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                time: value,
              }))
            }
          />
        </Grid>

        {/* Task Type */}

        <Grid size={{ xs: 6 }}>
          <FormSelect
            required
            label="Task Type"
            value={formData.taskType}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                taskType: Array.isArray(value) ? value[0] ?? "" : value,
              }))
            }
            options={[
              {
                label: "To Do",
                value: "to_do",
              },
              {
                label: "Follow Up",
                value: "follow_up",
              },
              {
                label: "Reminder",
                value: "reminder",
              },
            ]}
          />
        </Grid>

        {/* Priority */}

        <Grid size={{ xs: 6 }}>
          <FormSelect
            required
            label="Priority"
            value={formData.priority}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                priority: Array.isArray(value) ? value[0] ?? "" : value,
              }))
            }
            options={[
              {
                label: "Low",
                value: "low",
              },
              {
                label: "Medium",
                value: "medium",
              },
              {
                label: "High",
                value: "high",
              },
            ]}
          />
        </Grid>

        {/* Assigned To */}

        <Grid size={{ xs: 12 }}>
          <FormSelect
            required
            label="Assigned To"
            multiple
            value={formData.assignedTo}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                assignedTo: Array.isArray(value)
                  ? value.map(String)
                  : [],
              }))
            }
            options={filteredUsers.map((user) => ({
              label: `${user.first_name} ${user.last_name}`.trim(),
              value: String(user.id),
              secondaryLabel: user.email,
            }))}
          />
        </Grid>

        {/* Note */}

        <Grid size={{ xs: 12 }}>
          <RichTextEditor
            required
            label="Note"
            placeholder="Enter"
            minHeight={170}
            value={formData.notes}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                notes: value,
              }))
            }
          />
        </Grid>
      </Grid>
    </ActivityModal>
  );
}
