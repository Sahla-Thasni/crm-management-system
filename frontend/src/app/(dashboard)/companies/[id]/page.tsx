"use client";

import { Box, Divider, Grid, Paper, Stack } from "@mui/material";

import {
  AvatarActionSection,
  AboutSection,
  ActivitySection,
  RightSidebar,
} from "@/components/detailspage";


import { use, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import ActivityFormFactory from "@/components/detailspage/activityForms/ActivityFormFactory";
import { ActivityFormType } from "@/components/detailspage/activityForms/ActivityFormFactory";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function CompanyDetailsPage({ params }: Props) {
  const [activeTab, setActiveTab] = useState("Activity");
  const [openForm, setOpenForm] = useState(false);

  const [formType, setFormType] = useState<
    "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings"
  >("Notes");
  const handleOpenForm = (
    type: "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings"
  ) => {
    setFormType(type);
    setOpenForm(true);
  };
  const { id } = use(params);

  const [company, setCompany] = useState<any>(null);
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


  // -------------------- Data Fetching -------------------- //

  // Fetch company details

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);

        const response = await apiRequest<any>(
          `/companies/${id}/`
        );


        setCompany(response);
      } catch (error) {

        console.error("Failed to fetch company:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch company"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  // Fetch company notes

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await apiRequest<any>(
          `/companies/${id}/notes/`
        );
        setNotes(response.results ?? response ?? []);
      } catch (error) {
        console.error("Failed to fetch company notes:", error);
        setNotes([]);
      }
    };

    fetchNotes();
  }, [id]);

  // Fetch company tasks

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiRequest<any>(
          `/companies/${id}/tasks/`
        );

        setTasks(response.results ?? response ?? []);
      } catch (error) {
        console.error("Failed to fetch company tasks:", error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [id]);

  // Fetch company calls

  const fetchCalls = async () => {
    try {
      const response = await apiRequest<any>(`/companies/${id}/calls/`);
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
      console.error("Failed to fetch company calls:", error);
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
        const response = await apiRequest<any>(`/companies/${id}/calls/`);
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
        console.error("Failed to poll company call status:", error);
      }
    }, 2000);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [id, activeCallId]);

  // Fetch company emails

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await apiRequest<any>(
          `/companies/${id}/emails/`
        );

        setEmails(response.results ?? response ?? []);
      } catch (error) {
        console.error(
          "Failed to fetch company emails:",
          error
        );

        setEmails([]);
      }
    };

    fetchEmails();
  }, [id]);


  // Fetch company meetings

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await apiRequest<any>(
          `/companies/${id}/meetings/`
        );

        setMeetings(
          response.results ?? response ?? []
        );
      } catch (error) {
        console.error(
          "Failed to fetch company meetings:",
          error
        );

        setMeetings([]);
      }
    };

    fetchMeetings();
  }, [id]);

  // Fetch company attachments

  const fetchAttachments = async () => {
    try {
      const response = await apiRequest<any>(
        `/companies/${id}/attachments/`
      );

      setAttachments(
        response.results ?? response ?? []
      );
    } catch (error) {
      console.error(
        "Failed to fetch company attachments:",
        error
      );

      setAttachments([]);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [id]);





  // -------------------- Activity Data -------------------- //



  // Convert company notes into activity items

  const noteActivities = notes.map((note) => {
    const createdBy = note.created_by;

    const authorName =
      createdBy?.first_name || createdBy?.last_name
        ? `${createdBy.first_name ?? ""} ${createdBy.last_name ?? ""}`.trim()
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



  // Convert company tasks into activity items

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

    createdAt: task.created_at,
    completed: task.completed,
  }));

  // Update task completion status


  const handleTaskComplete = async (
    taskId: number,
    completed: boolean
  ) => {
    await apiRequest(`/companies/${id}/tasks/${taskId}/`, {
      method: "PATCH",
      body: JSON.stringify({
        completed: completed,
      }),
    });

    setTasks((prev) =>
      prev.map((task) =>
        Number(task.id) === Number(taskId)
          ? { ...task, completed: completed }
          : task
      )
    );
  };

  // Convert company calls into activity items

  const callActivities = calls.map((call) => ({
    id: Number(call.id),
    type: "Call",
    from: call.created_by
      ? `${call.created_by.first_name ?? ""} ${call.created_by.last_name ?? ""
        }`.trim()
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

  // Convert company emails into activity items

  const emailActivities = emails.map((email) => ({
    id: Number(email.id),
    type: "Email",

    from: email.created_by
      ? `${email.created_by.first_name ?? ""} ${email.created_by.last_name ?? ""
        }`.trim()
      : "",

    heading: ` - ${email.subject}`,
    subtitle: email.body ?? "",
    preview: email.body ?? "",


    recipients: email.recipients ?? [],
    cc: email.cc ?? [],
    bcc: email.bcc ?? [],
    to: email.recipients?.[0] ??
      company.email ??
      "",
    status: email.status ?? "",
    sentAt: email.sent_at,
    date: email.created_at,

    attachments: email.attachments ?? [],
  }));

  // Convert company meetings into activity items

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

    company: company,

    createdBy: meeting.created_by,

    createdAt: meeting.created_at,
  }));

  // Activities shown in the tabs

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




  if (loading) {
    return <div>Loading company...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }


  // -------------------- Company Update -------------------- //

  // Save updated company details

  const handleSaveCompany = async (data: any) => {
    try {
      const payload = {
        company_name: data.find(
          (item: any) => item.label === "Company Name"
        )?.value ?? "",

        domain_name: data.find(
          (item: any) => item.label === "Company Domain"
        )?.value ?? "",

        phone_number: data.find(
          (item: any) => item.label === "Phone Number"
        )?.value ?? "",

        industry: company.industry,

        company_type: company.company_type,

        city: data.find(
          (item: any) => item.label === "City"
        )?.value ?? "",

        country: data.find(
          (item: any) => item.label === "Country / Region"
        )?.value ?? "",

        number_of_employees:
          data.find(
            (item: any) => item.label === "No. of Employees"
          )?.value ?? null,

        annual_revenue:
          data.find(
            (item: any) => item.label === "Annual Revenue"
          )?.value ?? null,
      };

      await apiRequest(`/companies/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updatedCompany = await apiRequest<any>(
        `/companies/${id}/`
      );

      setCompany(updatedCompany);

    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

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
        console.error("Call not found:", callId);
        return;
      }

      await apiRequest(
        `/companies/${id}/calls/${callId}/`,
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
        "Failed to update company call outcome:",
        error
      );
    }
  };

  //Call duration

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

      await apiRequest(`/companies/${id}/calls/${callId}/`, {
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

  // Create one company call record, then instruct the backend to start it
  // through Twilio. The record is later updated from the Call form.
  const handleStartCall = async () => {
    try {
      if (!company?.phone_number) {
        console.error("Company phone number is not available.");
        return;
      }

      const now = new Date();
      const callResponse = await apiRequest<any>(`/companies/${id}/calls/`, {
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
        `/companies/${id}/calls/${callResponse.id}/start/`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Failed to start company phone call:", error);
    }
  };

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
              <Stack spacing={.75}>
                <AvatarActionSection
                  module="company"
                  profile={{
                    companyName: company.company_name,
                    industry: company.industry_name,
                    email: company.email,
                  }}
                  onActionClick={handleOpenForm}
                />
                <Divider sx={{ my: 0.5 }} />

                <AboutSection
                  title="About this Company"
                  data={[
                    {
                      label: "Company Domain",
                      value: company.domain_name ?? "",
                    },
                    {
                      label: "Company Name",
                      value: company.company_name ?? "",
                    },
                    {
                      label: "Industry",
                      value: company.industry_name ?? "",
                      readOnly: true,
                    },
                    {
                      label: "Phone Number",
                      value: company.phone_number ?? "",
                    },
                    {
                      label: "Company Owner",
                      value: company.company_owner_name ?? "",
                      readOnly: true,
                    },
                    {
                      label: "City",
                      value: company.city ?? "",
                    },
                    {
                      label: "Country / Region",
                      value: company.country ?? "",
                    },
                    {
                      label: "No. of Employees",
                      value: String(company.number_of_employees ?? ""),
                    },
                    {
                      label: "Annual Revenue",
                      value: String(company.annual_revenue ?? ""),
                    },
                    {
                      label: "Created Date",
                      value: company.created_at ?? "",
                      readOnly: true,
                    },
                  ]}
                  onSave={handleSaveCompany}
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

            {/* RIGHT SIDEBAR */}

            <Grid size={{ xs: 12, lg: 3 }}>

              <RightSidebar
                title="AI Company Summary"
                summary="There are no activities associated with this company and further details are needed to provide a comprehensive summary."
                attachments={attachments}
                attachmentEndpoint={`/companies/${id}/attachments/`}
                onAttachmentChange={fetchAttachments}
              />

            </Grid>
          </Grid>
        </Paper>
      </Box>

      <ActivityFormFactory
        type={formType as ActivityFormType}
        open={openForm}
        connectedName={company.company_name}
        connectedPhone={company.phone_number}
        onStartCall={handleStartCall}
        activeCallDuration={activeCallDuration}
        activeCallStatus={activeCallStatus}
        recipientEmail={company.email}
        emailEndpoint={`/companies/${id}/emails/`}
        attachments={attachments}
        contactOwnerIds={company?.company_owner ?? []}
        onClose={() => setOpenForm(false)}
        onSave={async (data: any) => {

          // -------------------- Activity Creation -------------------- //

          // Create company note

          if (formType === "Notes") {
            try {
              const response = await apiRequest<any>(
                `/companies/${id}/notes/`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    note: data.notes,
                  }),
                }
              );
              setNotes((prev) => {
                const exists = prev.some(
                  (note) => Number(note.id) === Number(response.id)
                );

                if (exists) {
                  return prev;
                }

                return [response, ...prev];
              });

              setOpenForm(false);
            } catch (error) {
              console.error(
                "Failed to create company note:",
                error
              );
            }
          }

          // Create company task

          if (formType === "Tasks") {
            try {
              const response = await apiRequest<any>(
                `/companies/${id}/tasks/`,
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
            } catch (error) {
              console.error(
                "Failed to create company task:",
                error
              );
            }
          }

          // Create company call

          if (formType === "Calls") {
            try {
              if (!data.date) {
                console.error("Call date is required");
                return;
              }

              if (!data.time) {
                console.error("Call time is required");
                return;
              }

              // A Twilio-started call already has a CRM record. Patch that
              // record so saving the form does not create a duplicate.
              const callIdToUpdate = activeCallIdRef.current ?? activeCallId;

              if (callIdToUpdate !== null) {
                const response = await apiRequest<any>(
                  `/companies/${id}/calls/${callIdToUpdate}/`,
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
                `/companies/${id}/calls/`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    note: data.notes,
                    call_outcome: data.callOutcome,
                    call_date: data.date.format("YYYY-MM-DD"),
                    call_time: data.time.format("HH:mm:ss"),
                    duration: null,
                  }),
                }
              );

              setCalls((prev) => [
                response,
                ...prev,
              ]);

              setOpenForm(false);
            } catch (error) {
              console.error(
                "Failed to create company call:",
                error
              );
            }
          }

          // Refresh company emails

          if (formType === "Emails") {
            const response = await apiRequest<any>(
              `/companies/${id}/emails/`
            );

            setEmails(response.results ?? response ?? []);

            setOpenForm(false);

            return;
          }

          // Create company meeting

          if (formType === "Meetings") {
            try {
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
                `/companies/${id}/meetings/`,
                {
                  method: "POST",
                  body: JSON.stringify(payload),
                }
              );

              const response = await apiRequest<any>(
                `/companies/${id}/meetings/`
              );

              setMeetings(
                response.results ?? response ?? []
              );

              setOpenForm(false);
            } catch (error) {
              console.error(
                "Failed to create company meeting:",
                error
              );
            }

            return;
          }
        }}
      />
    </>
  );
}
