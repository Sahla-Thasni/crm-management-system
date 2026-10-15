"use client";

import { TaskForm, MeetingForm, CallForm, NoteForm, EmailForm } from "./";

export type ActivityFormType =
  | "Tasks"
  | "Meetings"
  | "Calls"
  | "Notes"
  | "Emails";

interface ActivityFormFactoryProps {
  type: ActivityFormType;
  open: boolean;
  onClose: () => void;
  onSave?: (data: unknown) => void;
  connectedName?: string;
  connectedPhone?: string;
  onStartCall?: () => void;
  activeCallDuration?: number | "";
  activeCallStatus?: string;
  recipientEmail?: string;
  emailEndpoint?: string;
  attachments?: {
    id: number;
    file: string;
    file_name: string;
    file_size?: number | null;
  }[];
  contactOwnerIds?: number[];
}

export default function ActivityFormFactory({
  type,
  open,
  onClose,
  onSave,
  connectedName,
  connectedPhone,
  onStartCall,
  activeCallDuration,
  activeCallStatus,
  recipientEmail,
  emailEndpoint,
  attachments = [],
  contactOwnerIds = [],
}: ActivityFormFactoryProps) {
  const handleSave = (data: unknown) => {
    onSave?.(data);
  };

  switch (type) {
    case "Tasks":
      return (
        <TaskForm
          open={open}
          onClose={onClose}
          onSave={handleSave}
          contactOwnerIds={contactOwnerIds}
        />
      );

    case "Meetings":
      return (
        <MeetingForm
          open={open}
          onClose={onClose}
          onSave={handleSave}
          contactOwnerIds={contactOwnerIds}
        />
      );

    case "Calls":
      return (
        <CallForm
          open={open}
          onClose={onClose}
          onSave={handleSave}
          connectedName={connectedName}
          connectedPhone={connectedPhone}
          onStartCall={onStartCall}
          activeCallDuration={activeCallDuration}
          activeCallStatus={activeCallStatus}
        />
      );

    case "Notes":
      return <NoteForm open={open} onClose={onClose} onSave={handleSave} />;

    case "Emails":
      return (
        <EmailForm
          open={open}
          onClose={onClose}
          onSave={handleSave}
          recipientEmail={recipientEmail}
          emailEndpoint={emailEndpoint}
          attachments={attachments}
        />
      );

    default:
      return null;
  }
}
