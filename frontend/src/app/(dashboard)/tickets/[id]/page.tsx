"use client";

import { Box, Divider, Grid, Paper, Stack } from "@mui/material";

import {
  AvatarActionSection,
  AboutSection,
  ActivitySection,
  RightSidebar,
} from "@/components/detailspage";


import { use, useState, useEffect, useRef } from "react";
import ActivityFormFactory from "@/components/detailspage/activityForms/ActivityFormFactory";
import { ActivityFormType } from "@/components/detailspage/activityForms/ActivityFormFactory";
import { apiRequest } from "@/lib/api";
import {
  ActivityItem,
  ActivityTab,
} from "@/types/detailspage/activity";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function TicketDetailsPage({ params }: Props) {
  const [activeTab, setActiveTab] = useState("Activity");
  const [openForm, setOpenForm] = useState(false);

  const [formType, setFormType] = useState<
    "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings"
  >("Notes");
  const handleOpenForm = (
    type: "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings",
  ) => {
    setFormType(type);
    setOpenForm(true);
  };

  // -------------------- Activity State -------------------- //

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Twilio call state. The ref keeps the call ID available after polling
  // marks a completed call inactive, so saving the form updates that call.
  const activeCallIdRef = useRef<number | null>(null);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  const [activeCallDuration, setActiveCallDuration] = useState<number | "">("");
  const [activeCallStatus, setActiveCallStatus] = useState<string>("");
  const { id } = use(params);

  // -------------------- Data Fetching -------------------- //
  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest<any>(
          `/tickets/${id}/`
        );
        console.log("TICKET RESPONSE:", response);

        setTicket(response);
      } catch (error) {
        console.error(
          "Failed to fetch ticket:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // Fetch ticket notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await apiRequest<any>(
          `/tickets/${id}/notes/`
        );

        setNotes(
          response.results ?? response ?? []
        );
      } catch (error) {
        console.error(
          "Failed to fetch ticket notes:",
          error
        );

        setNotes([]);
      }
    };

    fetchNotes();
  }, [id]);

  // Fetch ticket tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiRequest<any>(
          `/tickets/${id}/tasks/`
        );

        setTasks(
          response.results ?? response ?? []
        );
      } catch (error) {
        console.error(
          "Failed to fetch ticket tasks:",
          error
        );

        setTasks([]);
      }
    };

    fetchTasks();
  }, [id]);

  // Fetch ticket calls
  const fetchCalls = async () => {
    try {
      const response = await apiRequest<any>(`/tickets/${id}/calls/`);
      const updatedCalls = response.results ?? response ?? [];

      setCalls(updatedCalls);

      const currentCallId = activeCallIdRef.current ?? activeCallId;
      if (currentCallId !== null) {
        const updatedCall = updatedCalls.find(
          (call: any) => Number(call.id) === Number(currentCallId)
        );

        if (updatedCall) {
          setActiveCallStatus(updatedCall.phone_call_status ?? "");

          if (
            updatedCall.phone_call_duration !== null &&
            updatedCall.phone_call_duration !== undefined
          ) {
            setActiveCallDuration(Number(updatedCall.phone_call_duration));
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch ticket calls:", error);
      setCalls([]);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [id]);

  // Poll the active Twilio call without creating additional CRM call records.
  useEffect(() => {
    if (activeCallId === null) {
      return;
    }

    let isPolling = true;
    const interval = setInterval(async () => {
      try {
        if (!isPolling) {
          return;
        }

        const currentCallId = activeCallIdRef.current ?? activeCallId;
        const response = await apiRequest<any>(`/tickets/${id}/calls/`);
        const updatedCalls = response.results ?? response ?? [];
        const updatedCall = updatedCalls.find(
          (call: any) => Number(call.id) === Number(currentCallId)
        );

        if (!updatedCall) {
          return;
        }

        setCalls((prev) => {
          const exists = prev.some(
            (call: any) => Number(call.id) === Number(updatedCall.id)
          );

          if (exists) {
            return prev.map((call: any) =>
              Number(call.id) === Number(updatedCall.id)
                ? { ...call, ...updatedCall }
                : call
            );
          }

          return [updatedCall, ...prev];
        });

        setActiveCallStatus(updatedCall.phone_call_status ?? "");

        if (
          updatedCall.phone_call_duration !== null &&
          updatedCall.phone_call_duration !== undefined
        ) {
          setActiveCallDuration(Number(updatedCall.phone_call_duration));
        }

        const finishedStatuses = [
          "completed",
          "failed",
          "canceled",
          "cancelled",
          "busy",
          "no-answer",
        ];
        const currentStatus = String(
          updatedCall.phone_call_status ?? ""
        ).toLowerCase();

        if (finishedStatuses.includes(currentStatus)) {
          clearInterval(interval);
          // Keep activeCallIdRef so a later form save patches this record.
          setActiveCallId(null);
        }
      } catch (error) {
        console.error("Failed to poll ticket call status:", error);
      }
    }, 2000);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [id, activeCallId]);

  // Fetch ticket emails
  const fetchEmails = async () => {
    try {
      const response = await apiRequest<any>(
        `/tickets/${id}/emails/`
      );

      setEmails(
        response.results ?? response ?? []
      );
    } catch (error) {
      console.error(
        "Failed to fetch ticket emails:",
        error
      );

      setEmails([]);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [id]);

  // Fetch ticket meetings
  const fetchMeetings = async () => {
    try {
      const response = await apiRequest<any>(
        `/tickets/${id}/meetings/`
      );

      setMeetings(
        response.results ?? response ?? []
      );
    } catch (error) {
      console.error(
        "Failed to fetch ticket meetings:",
        error
      );

      setMeetings([]);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [id]);

  // Fetch ticket attachments
  const fetchAttachments = async () => {
    try {
      const response = await apiRequest<any>(
        `/tickets/${id}/attachments/`
      );

      setAttachments(
        response.results ?? response ?? []
      );
    } catch (error) {
      console.error(
        "Failed to fetch ticket attachments:",
        error
      );

      setAttachments([]);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [id]);

  // -------------------- Activity Data -------------------- //

  // Convert ticket notes into activity items
  const noteActivities = notes.map((note) => {
    const createdBy = note.created_by;

    const authorName =
      createdBy?.first_name || createdBy?.last_name
        ? `${createdBy.first_name ?? ""} ${createdBy.last_name ?? ""
          }`.trim()
        : createdBy?.username ||
        createdBy?.email ||
        "Admin";

    return {
      id: Number(note.id),
      type: "Note",
      preview: note.note,
      body: note.note,
      description: note.note,
      author: authorName,
      date: note.created_at,
    };
  });

  // Convert ticket tasks into activity items
  const taskActivities = tasks.map((task) => ({
    id: Number(task.id),
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
            "Admin"
        )
        .join(", ")
      : "Admin",

    priority: task.priority,
    taskType: task.task_type,

    dueDate: task.due_date,
    completed: task.completed,

    createdAt: task.created_at,
  }));

  // Update task completion status
  const handleTaskComplete = async (
    taskId: number,
    completed: boolean
  ) => {
    try {
      await apiRequest(
        `/tickets/${id}/tasks/${taskId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            completed,
          }),
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          Number(task.id) === Number(taskId)
            ? {
              ...task,
              completed,
            }
            : task
        )
      );
    } catch (error) {
      console.error(
        "Failed to update ticket task:",
        error
      );
    }
  };

  // Convert ticket calls into activity items
  const callActivities = calls.map((call) => ({
    id: Number(call.id),
    type: "Call",

    from: call.created_by
      ? (
        `${call.created_by.first_name ?? ""} ${call.created_by.last_name ?? ""
          }`.trim() ||
        call.created_by.email ||
        "Admin"
      )
      : "Admin",

    description: call.note,
    preview: call.note,
    body: call.note,

    date: call.call_date,
    time: call.call_time,

    callOutcome: call.call_outcome,
    duration: call.duration,

    // Actual Twilio call metadata.
    phone_call_duration: call.phone_call_duration,
    phone_call_status: call.phone_call_status,

    createdAt: call.created_at,
  }));

  // Update call outcome
  const handleCallOutcomeChange = async (
    callId: number,
    outcome: string
  ) => {
    try {
      const call = calls.find(
        (item) => Number(item.id) === Number(callId)
      );

      if (!call) {
        console.error(
          "Call not found:",
          callId
        );
        return;
      }

      await apiRequest(
        `/tickets/${id}/calls/${callId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            call_outcome: outcome,
            call_date: call.call_date,
            call_time: call.call_time,
          }),
        }
      );

      setCalls((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(callId)
            ? {
              ...item,
              call_outcome: outcome,
            }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to update ticket call outcome:",
        error
      );
    }
  };

  // call duaration

  const handleCallDurationChange = async (
    callId: number,
    duration: number,
  ) => {
    try {
      const call = calls.find(
        (item) => Number(item.id) === Number(callId),
      );

      if (!call) {
        console.error("Call not found:", callId);
        return;
      }

      await apiRequest(`/tickets/${id}/calls/${callId}/`, {
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
            ? { ...item, duration }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update call duration:", error);
    }
  };

  // Create one ticket call record, then instruct the backend to start it
  // through Twilio. The record is later updated from the Call form.
  const handleStartCall = async () => {
    try {
      const connectedPhone =
        ticket?.associated_deal_details?.associated_lead_details?.phone_number ??
        ticket?.associated_deal_details?.associated_lead?.phone_number ??
        ticket?.associated_lead_details?.phone_number;

      if (!connectedPhone) {
        console.error("Ticket's associated lead phone number is not available.");
        return;
      }

      const now = new Date();
      const callResponse = await apiRequest<any>(`/tickets/${id}/calls/`, {
        method: "POST",
        body: JSON.stringify({
          note: "Phone call initiated from CRM.",
          call_outcome: null,
          call_date: now.toISOString().split("T")[0],
          call_time: now.toTimeString().split(" ")[0],
          duration: null,
        }),
      });

      setCalls((prev) => {
        const alreadyExists = prev.some(
          (call) => Number(call.id) === Number(callResponse.id)
        );

        if (alreadyExists) {
          return prev.map((call) =>
            Number(call.id) === Number(callResponse.id)
              ? { ...call, ...callResponse }
              : call
          );
        }

        return [callResponse, ...prev];
      });

      const newCallId = Number(callResponse.id);
      setActiveCallId(newCallId);
      activeCallIdRef.current = newCallId;
      setActiveCallDuration("");
      setActiveCallStatus("initiated");

      await apiRequest<any>(
        `/tickets/${id}/calls/${callResponse.id}/start/`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Failed to start ticket phone call:", error);
    }
  };
  // Convert ticket emails into activity items
  const emailActivities = emails.map((email) => ({
    id: Number(email.id),
    type: "Email",

    subject: email.subject ?? "",
    title: email.subject ?? "",
    heading: email.subject ?? "",

    to:
      ticket?.associated_deal_details?.associated_lead_details?.email ??
      ticket?.associated_deal_details?.associated_lead?.email ??
      email.recipients?.[0] ??
      "",
    from: email.created_by
      ? (
        `${email.created_by.first_name ?? ""} ${email.created_by.last_name ?? ""
          }`.trim() ||
        email.created_by.email ||
        "Admin"
      )
      : "Admin",

    author: email.created_by
      ? (
        `${email.created_by.first_name ?? ""} ${email.created_by.last_name ?? ""
          }`.trim() ||
        email.created_by.email ||
        "Admin"
      )
      : "Admin",

    body: email.body ?? "",
    subtitle: email.body ?? "",
    preview: email.body ?? "",

    recipients:
      email.recipients ??
      (
        ticket?.associated_deal_details
          ?.associated_lead_details?.email
          ? [
            ticket.associated_deal_details
              .associated_lead_details.email,
          ]
          : []
      ),
    cc: email.cc ?? [],
    bcc: email.bcc ?? [],

    status: email.status ?? "",
    sentAt: email.sent_at,
    date: email.created_at,

    attachments: email.attachments ?? [],
  }));

  // Convert ticket meetings into activity items
  const meetingActivities = meetings.map((meeting) => ({
    id: Number(meeting.id),
    type: "Meeting",

    title: meeting.title,
    description: meeting.note,

    meetingDate: meeting.start_date,
    startTime: meeting.start_time,
    endTime: meeting.end_time,

    location: meeting.location,
    reminder: meeting.reminder,

    attendees: meeting.attendees ?? [],

    ticket: ticket,

    createdBy: meeting.created_by,
    createdAt: meeting.created_at,
  }));

  // -------------------- Activity Creation -------------------- //

  const handleSaveActivity = async (
    type: string,
    data: any
  ) => {
    try {
      // Create ticket note
      if (type === "Notes") {
        const response = await apiRequest<any>(
          `/tickets/${id}/notes/`,
          {
            method: "POST",
            body: JSON.stringify({
              note: data.notes,
            }),
          }
        );

        setNotes((prev) => [
          response,
          ...prev,
        ]);

        setOpenForm(false);

        return;
      }

      // Create ticket task
      if (type === "Tasks") {
        const response = await apiRequest<any>(
          `/tickets/${id}/tasks/`,
          {
            method: "POST",
            body: JSON.stringify({
              title: data.taskName,
              note: data.notes,
              due_date: data.dueDate || null,
              due_time: data.time
                ? data.time.format("HH:mm:ss")
                : null,
              task_type: data.taskType,
              priority: data.priority,
              assigned_to_ids: data.assignedTo.map(Number),
            }),
          }
        );

        setTasks((prev) => [
          response,
          ...prev,
        ]);

        setOpenForm(false);

        return;
      }

      // Create ticket call
      if (type === "Calls") {
        if (!data.date || !data.time) {
          return;
        }

        // A Twilio-started call already has a CRM record. Patch that record
        // so saving the form does not create a duplicate.
        const callIdToUpdate = activeCallIdRef.current ?? activeCallId;

        if (callIdToUpdate !== null) {
          const response = await apiRequest<any>(
            `/tickets/${id}/calls/${callIdToUpdate}/`,
            {
              method: "PATCH",
              body: JSON.stringify({
                note: data.notes || "",
                call_outcome: data.callOutcome || null,
                call_date: data.date.format("YYYY-MM-DD"),
                call_time: data.time.format("HH:mm:ss"),
              }),
            }
          );

          setCalls((prev) =>
            prev.map((call) =>
              Number(call.id) === Number(callIdToUpdate)
                ? { ...call, ...response, note: data.notes || "" }
                : call
            )
          );

          setActiveCallId(null);
          activeCallIdRef.current = null;
          setActiveCallDuration("");
          setActiveCallStatus("not_started");
          setOpenForm(false);
          return;
        }

        // Manual calls retain the existing create behavior.
        const response = await apiRequest<any>(
          `/tickets/${id}/calls/`,
          {
            method: "POST",
            body: JSON.stringify({
              note: data.notes,
              call_outcome: data.callOutcome,
              call_date: data.date.format(
                "YYYY-MM-DD"
              ),
              call_time: data.time.format(
                "HH:mm:ss"
              ),
              duration: null,
            }),
          }
        );

        setCalls((prev) => [
          response,
          ...prev,
        ]);

        setOpenForm(false);

        return;
      }

      // Refresh ticket emails
      if (type === "Emails") {
        await fetchEmails();

        setOpenForm(false);

        return;
      }

      // Create ticket meeting
      if (type === "Meetings") {
        if (
          data.startTime &&
          data.endTime &&
          !data.endTime.isAfter(data.startTime)
        ) {
          console.error(
            "End time must be after start time."
          );

          return;
        }

        const payload = {
          title: data.meetingTitle,
          note: data.notes,
          start_date: data.startDate
            ? data.startDate.format("YYYY-MM-DD")
            : null,
          start_time: data.startTime
            ? data.startTime.format("HH:mm:ss")
            : null,
          end_time: data.endTime
            ? data.endTime.format("HH:mm:ss")
            : null,
          location: data.location,
          reminder: data.reminder || "none",
          attendees: data.attendees.map(Number),
        };

        await apiRequest(
          `/tickets/${id}/meetings/`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        await fetchMeetings();

        setOpenForm(false);

        return;
      }
    } catch (error) {
      console.error(
        `Failed to create ${type}:`,
        error
      );
    }
  };

  // Update ticket status
  const handleTicketStatusChange = async (
    newStatus: string
  ) => {
    try {
      const updatedTicket = await apiRequest<any>(
        `/tickets/${id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ticket_status: newStatus,
          }),
        }
      );

      setTicket(updatedTicket);
    } catch (error) {
      console.error(
        "Failed to update ticket status:",
        error
      );
    }
  };

  // Update ticket details
  const handleSaveTicket = async (data: any) => {
    try {
      const payload = {
        description:
          data.find(
            (item: any) =>
              item.label === "Ticket Description"
          )?.value ?? "",

        priority:
          data.find(
            (item: any) =>
              item.label === "Priority"
          )?.value ?? ticket.priority,

        ticket_status: ticket.ticket_status,
      };

      await apiRequest(`/tickets/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // Refresh ticket data after successful update
      const updatedTicket = await apiRequest<any>(
        `/tickets/${id}/`
      );

      setTicket(updatedTicket);
    } catch (error) {
      console.error(
        "Failed to update ticket:",
        error
      );
    }
  };

  if (loading) {
    return <div>Loading ticket...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }


  // -------------------- Activity Data -------------------- //

  const ticketActivities: ActivityItem[] = [
    {
      id: -(Number(ticket.id) * 2),
      type: "Ticket",
      title: "Ticket activity",

      author: ticket.ticket_owner_details?.[0]
        ? (
          `${ticket.ticket_owner_details[0].first_name ?? ""} ${ticket.ticket_owner_details[0].last_name ?? ""
            }`.trim() ||
          ticket.ticket_owner_details[0].email ||
          "Admin"
        )
        : "Admin",

      action: "moved ticket to",
      status: ticket.ticket_status ?? "",

      date: ticket.updated_at ?? ticket.created_at,
      highlightAuthor: true,
    },

    {
      id: -(Number(ticket.id) * 2 + 1),
      type: "TicketCreated",

      author: ticket.ticket_owner_details?.[0]
        ? (
          `${ticket.ticket_owner_details[0].first_name ?? ""} ${ticket.ticket_owner_details[0].last_name ?? ""
            }`.trim() ||
          ticket.ticket_owner_details[0].email ||
          "Admin"
        )
        : "Admin",

      date: ticket.created_at,
    },
  ];

  // -------------------- Activity Tabs -------------------- //

  const activities: ActivityTab[] = [
    {
      tab: "Activity",
      items: ticketActivities,
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

  const ticketRecipientEmail =
    ticket?.associated_deal_details?.associated_lead?.email ??
    ticket?.associated_lead_details?.email ??
    "";

  const associatedLead =
    ticket?.associated_deal_details?.associated_lead_details ??
    ticket?.associated_deal_details?.associated_lead;

  const associatedLeadName = associatedLead
    ? (
      `${associatedLead.first_name ?? ""} ${associatedLead.last_name ?? ""
        }`.trim() ||
      associatedLead.email ||
      "Admin"
    )
    : "Admin";

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
            {/* LEFT */}
            <Grid size={{ xs: 12, md: 3, lg: 2.8 }}>
              <Stack spacing={0.75}>
                <AvatarActionSection
                  module="ticket"
                  profile={{
                    ticketName: ticket.ticket_name ?? "",
                    status: ticket.ticket_status ?? "",
                    email: ticketRecipientEmail,
                  }}
                  onActionClick={handleOpenForm}
                  onStatusChange={handleTicketStatusChange}
                />
                <Divider sx={{ my: 0.5 }} />

                <AboutSection
                  title="About this Ticket"
                  data={[
                    {
                      label: "Ticket Description",
                      value: ticket.description ?? "",
                    },
                    {
                      label: "Ticket Owner",
                      value:
                        ticket.ticket_owner_details?.[0]
                          ? `${ticket.ticket_owner_details[0].first_name ?? ""} ${ticket.ticket_owner_details[0].last_name ?? ""
                            }`.trim() ||
                          ticket.ticket_owner_details[0].email ||
                          "Admin"
                          : "Admin",
                      readOnly: true,
                    },
                    {
                      label: "Priority",
                      value: ticket.priority ?? "",
                      readOnly: true,
                    },
                    {
                      label: "Created Date",
                      value: ticket.created_at ?? "",
                      readOnly: true,
                    },
                  ]}
                  onSave={handleSaveTicket}
                />
              </Stack>
            </Grid>

            {/* MIDDLE */}
            <Grid
              size={{ xs: 12, lg: 6.2 }}
              sx={{
                pr: 2,
                pl: 1,
              }}
            >
              <ActivitySection
                activities={activities}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenForm={handleOpenForm}
                onTaskComplete={handleTaskComplete}
                onCallOutcomeChange={handleCallOutcomeChange}
                onCallDurationChange={handleCallDurationChange}
              />
            </Grid>

            {/* RIGHT */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <RightSidebar
                title="AI Ticket Summary"
                summary="There are no activities associated with this ticket and further details are needed to provide a comprehensive summary."
                attachments={attachments}
                attachmentEndpoint={`/tickets/${id}/attachments/`}
                onAttachmentChange={fetchAttachments}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <ActivityFormFactory
        type={formType as ActivityFormType}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(data) =>
          handleSaveActivity(formType, data)
        }
        connectedName={associatedLeadName}
        connectedPhone={
          ticket?.associated_deal_details?.associated_lead_details?.phone_number ??
          ticket?.associated_deal_details?.associated_lead?.phone_number ??
          ticket?.associated_lead_details?.phone_number ??
          ""
        }
        onStartCall={handleStartCall}
        activeCallDuration={activeCallDuration}
        activeCallStatus={activeCallStatus}
        recipientEmail={ticketRecipientEmail}
        emailEndpoint={`/tickets/${id}/emails/`}
        attachments={attachments}
        contactOwnerIds={ticket?.ticket_owner ?? []}
      />
    </>
  );
}
