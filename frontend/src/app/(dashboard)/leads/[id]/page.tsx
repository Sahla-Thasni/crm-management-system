"use client";

import {
  Box,
  Divider,
  Grid,
  Paper,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";

import {
  AvatarActionSection,
  AboutSection,
  ActivitySection,
  RightSidebar,
} from "@/components/detailspage";

import { use, useEffect, useState, useRef } from "react";
import { apiRequest } from "@/lib/api";

import ActivityFormFactory from "@/components/detailspage/activityForms/ActivityFormFactory";
import { ActivityFormType } from "@/components/detailspage/activityForms/ActivityFormFactory";

import { Meeting } from "@/types/detailspage/activity";
import { createDeal } from "@/store/slices/dealsSlice";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function LeadDetailsPage({ params }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = use(params);

  // ---------------------------------------------------------
  // UI STATE
  // ---------------------------------------------------------

  const [activeTab, setActiveTab] = useState("Activity");
  const [openForm, setOpenForm] = useState(false);

  const [formType, setFormType] = useState<
    "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings"
  >("Notes");

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });

  const [converting, setConverting] = useState(false);

  // ---------------------------------------------------------
  // ACTIVITY STATE
  // ---------------------------------------------------------

  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const activeCallIdRef = useRef<number | null>(null);
  // ---------------------------------------------------------
  // ACTIVE TWILIO CALL STATE
  // ---------------------------------------------------------

  const [activeCallId, setActiveCallId] = useState<number | null>(null);

  const [activeCallDuration, setActiveCallDuration] = useState<number | "">("");

  const [activeCallStatus, setActiveCallStatus] = useState<string>("");

  // ---------------------------------------------------------
  // OPEN ACTIVITY FORM
  // ---------------------------------------------------------

  const handleOpenForm = (
    type: "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings",
  ) => {
    setFormType(type);
    setOpenForm(true);
  };

  // ---------------------------------------------------------
  // SNACKBAR
  // ---------------------------------------------------------

  const showSnackbar = (
    message: string,
    severity: "error" | "success" = "error",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =========================================================
  // FETCH LEAD
  // =========================================================

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest<any>(`/leads/${id}/`);

      setLead(response);
    } catch (error) {
      console.error("Failed to fetch lead:", error);

      setError(error instanceof Error ? error.message : "Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  // =========================================================
  // CONVERT LEAD TO DEAL
  // =========================================================

  const handleConvertLead = async () => {
    if (!lead) {
      return;
    }

    if (converting) {
      return;
    }

    const dealOwners = Array.isArray(lead.contact_owner)
      ? lead.contact_owner
      : [];

    if (dealOwners.length === 0) {
      showSnackbar(
        "This lead does not have a contact owner assigned.",
        "error",
      );

      return;
    }

    try {
      setConverting(true);
      setError(null);

      const dealName =
        `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || "New Deal";

      await dispatch(
        createDeal({
          deal_name: dealName,
          associated_lead: Number(lead.id),
          deal_stage: "Proposal Sent",
          deal_owner: dealOwners,
          close_date: new Date().toISOString().split("T")[0],
          priority: "Medium",
        }),
      ).unwrap();

      // Refresh lead so status is updated
      await fetchLead();

      showSnackbar("Lead converted successfully.", "success");
    } catch (error: any) {
      const message =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.detail ||
            "Failed to convert lead into a deal";

      showSnackbar(message, "error");
    } finally {
      setConverting(false);
    }
  };

  // =========================================================
  // FETCH NOTES
  // =========================================================

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await apiRequest<any>(`/leads/${id}/notes/`);

        setNotes(response.results ?? []);
      } catch (error) {
        console.error("Failed to fetch lead notes:", error);

        setNotes([]);
      }
    };

    fetchNotes();
  }, [id]);

  // =========================================================
  // FETCH TASKS
  // =========================================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiRequest<any>(`/leads/${id}/tasks/`);

        console.log("LEAD TASKS RESPONSE:", response);

        setTasks(response.results ?? response ?? []);
      } catch (error) {
        console.error("Failed to fetch lead tasks:", error);

        setTasks([]);
      }
    };

    fetchTasks();
  }, [id]);

  // =========================================================
  // FETCH CALLS
  // =========================================================

  // =========================================================
  // FETCH CALLS
  // =========================================================

  const fetchCalls = async () => {
    try {
      const response = await apiRequest<any>(`/leads/${id}/calls/`);

      const updatedCalls = response.results ?? response ?? [];

      setCalls(updatedCalls);

      // -------------------------------------------------------
      // If a Twilio call is currently active,
      // update its status and duration
      // -------------------------------------------------------

      const currentCallId = activeCallIdRef.current ?? activeCallId;

      if (currentCallId !== null) {
        const updatedCall = updatedCalls.find(
          (call: any) => Number(call.id) === Number(currentCallId),
        );

        if (updatedCall) {
          console.log("UPDATED CALL FROM BACKEND:", updatedCall);

          // Update Twilio status
          setActiveCallStatus(updatedCall.phone_call_status ?? "");

          // Update actual Twilio duration
          if (
            updatedCall.phone_call_duration !== null &&
            updatedCall.phone_call_duration !== undefined
          ) {
            const durationSeconds = Number(updatedCall.phone_call_duration);

            console.log(
              "UPDATED TWILIO CALL DURATION:",
              durationSeconds,
              "seconds",
            );

            setActiveCallDuration(durationSeconds);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch lead calls:", error);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [id]);

  // =========================================================
  // POLL ACTIVE TWILIO CALL
  // =========================================================

  useEffect(() => {
    if (activeCallId === null) {
      return;
    }

    console.log("STARTING CALL POLLING FOR CALL ID:", activeCallId);

    let isPolling = true;

    const interval = setInterval(async () => {
      try {
        if (!isPolling) {
          return;
        }

        const currentCallId = activeCallIdRef.current ?? activeCallId;

        console.log("CHECKING CALL STATUS:", currentCallId);

        const response = await apiRequest<any>(`/leads/${id}/calls/`);

        const updatedCalls = response.results ?? response ?? [];

        // -----------------------------------------------------
        // Find the SAME Twilio call
        // -----------------------------------------------------

        const updatedCall = updatedCalls.find(
          (call: any) => Number(call.id) === Number(currentCallId),
        );

        if (!updatedCall) {
          return;
        }

        console.log("POLLED CALL:", updatedCall);

        // -----------------------------------------------------
        // UPDATE EXISTING CALL IN STATE
        // -----------------------------------------------------

        setCalls((prev) => {
          const exists = prev.some(
            (call: any) => Number(call.id) === Number(updatedCall.id),
          );

          if (exists) {
            return prev.map((call: any) =>
              Number(call.id) === Number(updatedCall.id)
                ? {
                    ...call,
                    ...updatedCall,
                  }
                : call,
            );
          }

          // Add only if it doesn't already exist
          return [updatedCall, ...prev];
        });

        // -----------------------------------------------------
        // UPDATE CALL STATUS
        // -----------------------------------------------------

        setActiveCallStatus(updatedCall.phone_call_status ?? "");

        // -----------------------------------------------------
        // UPDATE ACTUAL TWILIO DURATION
        // -----------------------------------------------------

        if (
          updatedCall.phone_call_duration !== null &&
          updatedCall.phone_call_duration !== undefined
        ) {
          const durationSeconds = Number(updatedCall.phone_call_duration);

          console.log(
            "TWILIO CALL DURATION RECEIVED:",
            durationSeconds,
            "seconds",
          );

          setActiveCallDuration(durationSeconds);
        }

        // -----------------------------------------------------
        // STOP POLLING WHEN CALL IS FINISHED
        // -----------------------------------------------------

        const finishedStatuses = [
          "completed",
          "failed",
          "canceled",
          "cancelled",
          "busy",
          "no-answer",
        ];

        const currentStatus = String(
          updatedCall.phone_call_status ?? "",
        ).toLowerCase();

        if (finishedStatuses.includes(currentStatus)) {
          console.log("CALL FINISHED - STOPPING POLLING");

          clearInterval(interval);

          // IMPORTANT:
          // Clear React state, BUT KEEP the ref.
          //
          // The form still needs this ID when the user
          // clicks Save after the call has finished.
          setActiveCallId(null);
        }
      } catch (error) {
        console.error("Failed to poll call status:", error);
      }
    }, 2000);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [id, activeCallId]);

  // =========================================================
  // FETCH EMAILS
  // =========================================================

  const fetchEmails = async () => {
    try {
      const response = (await apiRequest(`/leads/${id}/emails/`)) as {
        results?: any[];
      };

      setEmails(response.results ?? []);
    } catch (error) {
      console.error("Failed to fetch lead emails:", error);

      setEmails([]);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [id]);

  // =========================================================
  // FETCH MEETINGS
  // =========================================================

  const fetchMeetings = async () => {
    try {
      const response = (await apiRequest(`/leads/${id}/meetings/`)) as {
        results?: any[];
      };

      setMeetings(response.results ?? []);
    } catch (error) {
      console.error("Failed to fetch lead meetings:", error);

      setMeetings([]);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [id]);

  // =========================================================
  // FETCH ATTACHMENTS
  // =========================================================

  const fetchAttachments = async () => {
    try {
      const response = await apiRequest<any>(`/leads/${id}/attachments/`);

      setAttachments(response.results ?? response ?? []);
    } catch (error) {
      console.error("Failed to fetch lead attachments:", error);

      setAttachments([]);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [id]);

  // =========================================================
  // NOTE ACTIVITIES
  // =========================================================

  const noteActivities = notes.map((note) => {
    const createdBy = note.created_by;

    const authorName =
      createdBy?.first_name || createdBy?.last_name
        ? `${createdBy.first_name ?? ""} ${createdBy.last_name ?? ""}`.trim()
        : createdBy?.username || createdBy?.email || "Admin";

    return {
      id: note.id,
      type: "Note",

      preview: note.note,
      body: note.note,
      description: note.note,

      author: authorName,
      date: note.created_at,
    };
  });

  // =========================================================
  // TASK ACTIVITIES
  // =========================================================

  const taskActivities = tasks.map((task) => ({
    id: task.id,
    type: "Task",

    title: task.title,
    description: task.note,
    preview: task.note,
    body: task.note,

    dueTime: task.due_time,

    assignedTo: Array.isArray(task.assigned_to)
      ? task.assigned_to
          .map(
            (user: any) =>
              `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
              user.email ||
              "Admin",
          )
          .join(", ")
      : "Admin",

    priority: task.priority,
    taskType: task.task_type,

    dueDate: task.due_date,
    completed: task.completed,

    createdAt: task.created_at,
  }));

  // =========================================================
  // TASK COMPLETE
  // =========================================================

  const handleTaskComplete = async (taskId: number, completed: boolean) => {
    try {
      await apiRequest(`/leads/${id}/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          completed,
        }),
      });

      setTasks((prev) =>
        prev.map((task) =>
          Number(task.id) === Number(taskId)
            ? {
                ...task,
                completed,
              }
            : task,
        ),
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // =========================================================
  // CALL ACTIVITIES
  // =========================================================

  const callActivities = calls.map((call) => ({
    id: call.id,
    type: "Call",

    from: call.created_by
      ? `${call.created_by.first_name ?? ""} ${
          call.created_by.last_name ?? ""
        }`.trim()
      : "Admin",

    description: call.note,
    preview: call.note,
    body: call.note,

    date: call.call_date,
    time: call.call_time,

    callOutcome: call.call_outcome,

    // Manual CRM duration
    duration: call.duration,

    // Actual Twilio duration
    phone_call_duration: call.phone_call_duration,

    // Twilio status
    phone_call_status: call.phone_call_status,

    createdAt: call.created_at,
  }));

  // =========================================================
  // EMAIL ACTIVITIES
  // =========================================================

  const emailActivities = emails.map((email) => ({
    id: email.id,
    type: "Email",

    subject: email.subject ?? "",
    title: email.subject ?? "",
    heading: email.subject ?? "",

    to: lead ? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() : "",

    from: email.created_by
      ? `${email.created_by.first_name ?? ""} ${
          email.created_by.last_name ?? ""
        }`.trim() ||
        email.created_by.email ||
        "Admin"
      : "Admin",

    author: email.created_by
      ? `${email.created_by.first_name ?? ""} ${
          email.created_by.last_name ?? ""
        }`.trim()
      : "",

    body: email.body ?? "",
    subtitle: email.body ?? "",
    preview: email.body ?? "",

    recipients: email.recipients ?? [],
    cc: email.cc ?? [],
    bcc: email.bcc ?? [],

    status: email.status ?? "",
    sentAt: email.sent_at,
    date: email.created_at,

    attachments: email.attachments ?? [],
  }));

  // =========================================================
  // UPDATE CALL OUTCOME
  // =========================================================

  const handleCallOutcomeChange = async (callId: number, outcome: string) => {
    try {
      const call = calls.find((item) => Number(item.id) === Number(callId));

      if (!call) {
        console.error("Call not found:", callId);

        return;
      }

      await apiRequest(`/leads/${id}/calls/${callId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          call_outcome: outcome,
          call_date: call.call_date,
          call_time: call.call_time,
        }),
      });

      setCalls((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(callId)
            ? {
                ...item,
                call_outcome: outcome,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update call outcome:", error);
    }
  };

  // =========================================================
  // UPDATE CALL DURATION
  // =========================================================

  const handleCallDurationChange = async (callId: number, duration: number) => {
    try {
      const call = calls.find((item) => Number(item.id) === Number(callId));

      if (!call) {
        console.error("Call not found:", callId);

        return;
      }

      await apiRequest(`/leads/${id}/calls/${callId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          duration,
          call_date: call.call_date,
          call_time: call.call_time,
        }),
      });

      setCalls((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(callId)
            ? {
                ...item,
                duration,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update call duration:", error);
    }
  };

  // =========================================================
  // MEETING ACTIVITIES
  // =========================================================

  const meetingActivities = meetings.map((meeting) => {
    return {
      id: meeting.id,
      type: "Meeting",

      title: meeting.title,
      description: meeting.note,

      meetingDate: meeting.start_date,
      startTime: meeting.start_time,
      endTime: meeting.end_time,

      location: meeting.location,
      reminder: meeting.reminder,

      attendees: meeting.attendees ?? [],

      attendeeCount: Array.isArray(meeting.attendees)
        ? meeting.attendees.length
        : 0,

      lead,

      createdBy: meeting.created_by,

      createdAt: meeting.created_at,
    };
  });

  // =========================================================
  // SAVE ACTIVITY
  // =========================================================

  const handleSaveActivity = async (type: string, data: any) => {
    try {
      // -----------------------------------------------------
      // CREATE NOTE
      // -----------------------------------------------------

      if (type === "Notes") {
        const response = await apiRequest(`/leads/${id}/notes/`, {
          method: "POST",
          body: JSON.stringify({
            note: data.notes,
          }),
        });

        setNotes((prev) => [response, ...prev]);

        setOpenForm(false);

        return;
      }

      // -----------------------------------------------------
      // CREATE TASK
      // -----------------------------------------------------

      if (type === "Tasks") {
        const response = await apiRequest(`/leads/${id}/tasks/`, {
          method: "POST",
          body: JSON.stringify({
            title: data.taskName,
            note: data.notes,

            due_date: data.dueDate || null,

            due_time: data.time ? data.time.format("HH:mm:ss") : null,

            task_type: data.taskType,

            priority: data.priority,

            assigned_to_ids: Array.isArray(data.assignedTo)
              ? data.assignedTo.map(Number)
              : [],
          }),
        });

        console.log("TASK CREATED:", response);

        setTasks((prev) => [response, ...prev]);

        setOpenForm(false);

        return;
      }

      // -----------------------------------------------------
      // CREATE / UPDATE CALL
      // -----------------------------------------------------

      if (type === "Calls") {
        if (!data.date) {
          console.error("Call date is required");
          return;
        }

        if (!data.time) {
          console.error("Call time is required");
          return;
        }

        // -----------------------------------------------------
        // Get the existing Twilio call ID.
        //
        // Ref is checked first because polling intentionally
        // clears activeCallId after the call finishes.
        // -----------------------------------------------------

        const callIdToUpdate = activeCallIdRef.current ?? activeCallId;

        console.log("========== SAVE CALL ==========");
        console.log("ACTIVE CALL STATE:", activeCallId);
        console.log("ACTIVE CALL REF:", activeCallIdRef.current);
        console.log("CALL ID TO UPDATE:", callIdToUpdate);
        console.log("FORM DATA:", data);
        console.log("FORM NOTE:", data.notes);
        console.log("===============================");

        // =====================================================
        // TWILIO CALL EXISTS
        // UPDATE THE SAME CALL RECORD
        // =====================================================

        if (callIdToUpdate !== null) {
          const response = await apiRequest<any>(
            `/leads/${id}/calls/${callIdToUpdate}/`,
            {
              method: "PATCH",
              body: JSON.stringify({
                // Note entered in the Call form
                note: data.notes || "",

                // Outcome selected in the Call form
                call_outcome: data.callOutcome || null,

                // Date selected in the Call form
                call_date: data.date.format("YYYY-MM-DD"),

                // Time selected in the Call form
                call_time: data.time.format("HH:mm:ss"),
              }),
            },
          );

          console.log("========== CALL UPDATED ==========");

          console.log("CALL ID:", callIdToUpdate);

          console.log("SAVED NOTE:", response?.note);

          console.log("CALL OUTCOME:", response?.call_outcome);

          console.log("PHONE CALL STATUS:", response?.phone_call_status);

          console.log("PHONE CALL DURATION:", response?.phone_call_duration);

          console.log("==================================");

          // ---------------------------------------------------
          // Update the SAME call card
          // ---------------------------------------------------

          setCalls((prev) =>
            prev.map((call) =>
              Number(call.id) === Number(callIdToUpdate)
                ? {
                    ...call,
                    ...response,
                    note: data.notes || "",
                  }
                : call,
            ),
          );

          // ---------------------------------------------------
          // Clear active call AFTER successful save
          // ---------------------------------------------------

          setActiveCallId(null);

          activeCallIdRef.current = null;

          setActiveCallDuration("");

          setActiveCallStatus("not_started");

          setOpenForm(false);

          return;
        }

        // =====================================================
        // NORMAL MANUAL CALL
        // =====================================================

        console.log("NO ACTIVE TWILIO CALL - CREATING MANUAL CALL");

        const response = await apiRequest<any>(`/leads/${id}/calls/`, {
          method: "POST",
          body: JSON.stringify({
            note: data.notes,
            call_outcome: data.callOutcome,
            call_date: data.date.format("YYYY-MM-DD"),
            call_time: data.time.format("HH:mm:ss"),
            duration: null,
          }),
        });

        setCalls((prev) => [response, ...prev]);

        setOpenForm(false);

        return;
      }
      // -----------------------------------------------------
      // CREATE MEETING
      // -----------------------------------------------------

      if (type === "Meetings") {
        console.log("LEAD MEETING FORM DATA:", data);

        console.log("LEAD MEETING ATTENDEES:", data.attendees);

        const payload = {
          title: data.meetingTitle,

          note: data.notes,

          start_date: data.startDate?.format("YYYY-MM-DD"),

          start_time: data.startTime?.format("HH:mm:ss"),

          end_time: data.endTime?.format("HH:mm:ss"),

          location: data.location,

          reminder: data.reminder || "none",

          attendees: Array.isArray(data.attendees)
            ? data.attendees.map(Number)
            : [],
        };

        await apiRequest(`/leads/${id}/meetings/`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await fetchMeetings();

        setOpenForm(false);

        return;
      }
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
    }
  };

  // =========================================================
  // START TWILIO CALL
  // =========================================================

  const handleStartCall = async () => {
    try {
      // -----------------------------------------------------
      // CHECK LEAD PHONE
      // -----------------------------------------------------

      if (!lead?.phone_number) {
        showSnackbar("Lead phone number is not available.", "error");

        return;
      }

      console.log("STEP A: Creating call...");

      const now = new Date();

      // -----------------------------------------------------
      // STEP A
      // CREATE CALL RECORD
      // -----------------------------------------------------

      const callResponse = await apiRequest<any>(`/leads/${id}/calls/`, {
        method: "POST",

        body: JSON.stringify({
          note: "Phone call initiated from CRM.",

          call_outcome: null,

          call_date: now.toISOString().split("T")[0],

          call_time: now.toTimeString().split(" ")[0],

          duration: null,
        }),
      });

      console.log("STEP A SUCCESS - Call created:", callResponse);

      // -----------------------------------------------------
      // ADD CALL ONLY ONCE
      // -----------------------------------------------------

      setCalls((prev) => {
        const alreadyExists = prev.some(
          (call) => Number(call.id) === Number(callResponse.id),
        );

        if (alreadyExists) {
          return prev.map((call) =>
            Number(call.id) === Number(callResponse.id)
              ? {
                  ...call,
                  ...callResponse,
                }
              : call,
          );
        }

        return [callResponse, ...prev];
      });

      // -----------------------------------------------------
      // SET ACTIVE CALL
      // -----------------------------------------------------

      // setActiveCallId(Number(callResponse.id));

      const newCallId = Number(callResponse.id);

      setActiveCallId(newCallId);
      activeCallIdRef.current = newCallId;

      setActiveCallDuration("");

      setActiveCallStatus("initiated");

      console.log("ACTIVE CALL ID SET:", Number(callResponse.id));

      // -----------------------------------------------------
      // STEP B
      // START PHONE CALL
      // -----------------------------------------------------

      console.log("STEP B: Starting phone call...");

      console.log("Start URL:", `/leads/${id}/calls/${callResponse.id}/start/`);

      const startResponse = await apiRequest<any>(
        `/leads/${id}/calls/${callResponse.id}/start/`,
        {
          method: "POST",
        },
      );

      console.log("STEP B SUCCESS - Phone call started:", startResponse);

      // -----------------------------------------------------
      // CALL STARTED
      // -----------------------------------------------------
      // Do NOT manually set "ringing".
      // Twilio/backend polling will provide the real status.

      showSnackbar(
        "Phone call started successfully. Waiting for Twilio call status...",
        "success",
      );
    } catch (error: any) {
      console.error("PHONE CALL ERROR:", error);

      showSnackbar(
        error?.message || error?.detail || "Failed to start phone call.",
        "error",
      );
    }
  };

  // =========================================================
  // SAVE LEAD
  // =========================================================

  const handleSaveLead = async (
    data: {
      label: string;
      value: string;
    }[],
  ) => {
    try {
      const payload = {
        email: data.find((item) => item.label === "Email")?.value ?? "",

        first_name:
          data.find((item) => item.label === "First Name")?.value ?? "",

        last_name: data.find((item) => item.label === "Last Name")?.value ?? "",

        phone_number:
          data.find((item) => item.label === "Phone Number")?.value ?? "",

        lead_status:
          data.find((item) => item.label === "Lead Status")?.value ?? "",

        job_title: data.find((item) => item.label === "Job Title")?.value ?? "",
      };

      await apiRequest(`/leads/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await fetchLead();
    } catch (error) {
      console.error("Failed to save lead:", error);
    }
  };

  // =========================================================
  // ALL ACTIVITIES
  // =========================================================

  const activities = [
    {
      tab: "Activity",
      items: [],
    },

    {
      tab: "Notes",
      items: noteActivities,
    },

    {
      tab: "Emails",
      items: emailActivities,
    },

    {
      tab: "Calls",
      items: callActivities,
    },

    {
      tab: "Tasks",
      items: taskActivities,
    },

    {
      tab: "Meetings",
      items: meetingActivities,
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return <div>Loading lead...</div>;
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return <div>{error}</div>;
  }

  // =========================================================
  // LEAD NOT FOUND
  // =========================================================

  if (!lead) {
    return <div>Lead not found</div>;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <Box
        sx={{
          pt: 2,
          px: 1,
          bgcolor: "background.default",
          height: "100%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.paper",
            height: "100%",
          }}
        >
          <Grid container spacing={1}>
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <Grid
              size={{
                xs: 12,
                md: 3,
                lg: 2.8,
              }}
            >
              <Stack spacing={0.75}>
                <AvatarActionSection
                  module="lead"
                  profile={{
                    firstName: lead.first_name,

                    lastName: lead.last_name,

                    email: lead.email,

                    phone: lead.phone_number,

                    status: lead.lead_status,

                    designation: lead.job_title,
                  }}
                  onActionClick={handleOpenForm}
                />

                <Divider
                  sx={{
                    my: 0.5,
                  }}
                />

                <AboutSection
                  title="About this Lead"
                  data={[
                    {
                      label: "Email",
                      value: lead.email,
                    },

                    {
                      label: "First Name",
                      value: lead.first_name,
                    },

                    {
                      label: "Last Name",
                      value: lead.last_name,
                    },

                    {
                      label: "Phone Number",
                      value: lead.phone_number,
                    },

                    {
                      label: "Lead Status",
                      value: lead.lead_status,
                    },

                    {
                      label: "Job Title",
                      value: lead.job_title,
                    },

                    {
                      label: "Created Date",
                      value: lead.created_at,
                      readOnly: true,
                    },
                  ]}
                  onSave={handleSaveLead}
                />
              </Stack>
            </Grid>

            {/* =================================================
                MIDDLE
            ================================================= */}

            <Grid
              size={{
                xs: 12,
                lg: 6.2,
              }}
              sx={{
                pr: 2,
                pl: 1,
              }}
            >
              <ActivitySection
                activities={activities}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showButton
                buttonText="Convert"
                onOpenForm={handleOpenForm}
                onButtonClick={handleConvertLead}
                onTaskComplete={handleTaskComplete}
                onCallOutcomeChange={handleCallOutcomeChange}
                onCallDurationChange={handleCallDurationChange}
              />
            </Grid>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <Grid
              size={{
                xs: 12,
                lg: 3,
              }}
            >
              <RightSidebar
                title="AI Lead Summary"
                summary="There are no activities associated with this lead and further details are needed to provide a comprehensive summary."
                attachments={attachments}
                attachmentEndpoint={`/leads/${id}/attachments/`}
                onAttachmentChange={fetchAttachments}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* =====================================================
          ACTIVITY FORM
      ===================================================== */}

      <ActivityFormFactory
        type={formType as ActivityFormType}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(data) => handleSaveActivity(formType, data)}
        connectedName={
          lead ? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() : ""
        }
        connectedPhone={lead?.phone_number}
        onStartCall={handleStartCall}
        activeCallDuration={activeCallDuration}
        activeCallStatus={activeCallStatus}
        recipientEmail={lead?.email}
        emailEndpoint={`/leads/${id}/emails/`}
        attachments={attachments}
        contactOwnerIds={lead?.contact_owner ?? []}
      />

      {/* =====================================================
          SNACKBAR
      ===================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
