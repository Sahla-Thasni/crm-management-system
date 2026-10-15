"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid";

import ActivityModal from "./ActivityModal";
import { CallFormData, CallFormProps } from "./types";

import Button from "@mui/material/Button";
import PhoneIcon from "@mui/icons-material/Phone";

import {
  FormSelect,
  FormDatePicker,
  FormTimePicker,
  RichTextEditor,
} from "@/components/form";

const initialState: CallFormData = {
  connected: "",
  callOutcome: "",
  date: null,
  time: null,
  notes: "",
  duration: "",
};

export default function CallForm({
  open,
  onClose,
  onSave,
  connectedName,
  connectedPhone,
  onStartCall,
  activeCallDuration,
  activeCallStatus,
}: CallFormProps) {
  const [formData, setFormData] = useState<CallFormData>(initialState);

  // ------------------------------------------------------------
  // AUTOMATICALLY UPDATE DURATION
  // Backend/Twilio provides the actual duration in seconds.
  // ------------------------------------------------------------

  useEffect(() => {
    if (activeCallDuration !== undefined && activeCallDuration !== "") {
      setFormData((prev) => ({
        ...prev,
        duration: Number(activeCallDuration),
      }));
    }
  }, [activeCallDuration]);

  // ------------------------------------------------------------
  // AUTOMATICALLY UPDATE CALL STATUS / OUTCOME
  // ------------------------------------------------------------

  useEffect(() => {
    if (!activeCallStatus) {
      return;
    }

    let outcome = "";

    switch (activeCallStatus) {
      case "completed":
        outcome = "connected";
        break;

      case "busy":
        outcome = "busy";
        break;

      case "canceled":
      case "failed":
        outcome = "no_answer";
        break;

      case "initiated":
      case "ringing":
      case "in_progress":
        outcome = "";
        break;

      default:
        outcome = "";
    }

    const now = dayjs();

    setFormData((prev) => ({
      ...prev,
      callOutcome: outcome,
      date: prev.date ?? now,
      time: prev.time ?? now,
    }));
  }, [activeCallStatus]);

  // ------------------------------------------------------------
  // SAVE
  // ------------------------------------------------------------

  const handleSave = async () => {
    console.log("CALL FORM DATA:", formData);

    onSave?.(formData);

    setFormData(initialState);

    onClose();
  };

  // ------------------------------------------------------------
  // START CALL
  // ------------------------------------------------------------

  const handleCall = () => {
    if (!connectedPhone) {
      console.error("Phone number is not available");
      return;
    }

    const now = dayjs();

    setFormData((prev) => ({
      ...prev,
      date: now,
      time: now,
    }));

    onStartCall?.();
  };

  // ------------------------------------------------------------
  // DISPLAY STATUS
  // ------------------------------------------------------------

  const getStatusLabel = () => {
    switch (activeCallStatus) {
      case "not_started":
        return "Not Started";

      case "initiated":
        return "Initiated";

      case "ringing":
        return "Ringing";

      case "in_progress":
        return "In Progress";

      case "completed":
        return "Completed";

      case "failed":
        return "Failed";

      case "canceled":
        return "Canceled";

      default:
        return "Not Started";
    }
  };

  // ------------------------------------------------------------
  // DISPLAY OUTCOME
  // ------------------------------------------------------------

  const getOutcomeLabel = () => {
    switch (formData.callOutcome) {
      case "connected":
        return "Connected";

      case "no_answer":
        return "No Answer";

      case "busy":
        return "Busy";

      case "voicemail":
        return "Voicemail";

      case "follow_up":
        return "Follow Up";

      default:
        return "Waiting for call...";
    }
  };

  // ------------------------------------------------------------
  // DISPLAY DURATION
  // ------------------------------------------------------------

  const getDurationLabel = () => {
    if (
      activeCallDuration === undefined ||
      activeCallDuration === null ||
      activeCallDuration === ""
    ) {
      return "0 seconds";
    }

    const seconds = Number(activeCallDuration);

    if (Number.isNaN(seconds)) {
      return "0 seconds";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <ActivityModal
      open={open}
      title="Log Call"
      variant="drawer"
      onClose={onClose}
      onSave={handleSave}
    >
      <Grid container spacing={2}>
        {/* -------------------------------------------------- */}
        {/* CONNECTED */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <FormSelect
            required
            label="Connected"
            value={connectedName ?? ""}
            onChange={() => {}}
            options={[
              {
                label: connectedName ?? "",
                value: connectedName ?? "",
              },
            ]}
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* CALL BUTTON */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            startIcon={<PhoneIcon />}
            onClick={handleCall}
            disabled={!connectedPhone}
            fullWidth
          >
            {activeCallStatus === "ringing"
              ? "Ringing..."
              : activeCallStatus === "in_progress"
                ? "Call In Progress..."
                : activeCallStatus === "completed"
                  ? "Call Completed"
                  : `Call ${connectedName ?? ""}`}
          </Button>
        </Grid>

        {/* -------------------------------------------------- */}
        {/* AUTOMATIC CALL STATUS */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <FormSelect
            required
            label="Call Status"
            value={activeCallStatus ?? "not_started"}
            onChange={() => {}}
            options={[
              {
                label: getStatusLabel(),
                value: activeCallStatus ?? "not_started",
              },
            ]}
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* AUTOMATIC CALL OUTCOME */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <FormSelect
            required
            label="Call Outcome"
            value={formData.callOutcome}
            onChange={() => {}}
            options={[
              {
                label: getOutcomeLabel(),
                value: formData.callOutcome,
              },
            ]}
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* AUTOMATIC DURATION */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <FormSelect
            required
            label="Call Duration"
            value={
              activeCallDuration === undefined || activeCallDuration === ""
                ? ""
                : String(activeCallDuration)
            }
            onChange={() => {}}
            options={[
              {
                label: getDurationLabel(),
                value:
                  activeCallDuration === undefined || activeCallDuration === ""
                    ? ""
                    : String(activeCallDuration),
              },
            ]}
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* DATE */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 6 }}>
          <FormDatePicker
            required
            label="Date"
            value={formData.date}
            onChange={(value) =>
              setFormData({
                ...formData,
                date: value,
              })
            }
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* TIME */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 6 }}>
          <FormTimePicker
            required
            label="Time"
            value={formData.time}
            onChange={(value) =>
              setFormData({
                ...formData,
                time: value,
              })
            }
          />
        </Grid>

        {/* -------------------------------------------------- */}
        {/* NOTE */}
        {/* -------------------------------------------------- */}

        <Grid size={{ xs: 12 }}>
          <RichTextEditor
            required
            label="Note"
            placeholder="Enter"
            minHeight={170}
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
