import { ReactNode } from "react";
import { Dayjs } from "dayjs";

export interface ActivityModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/* ---------- Task ---------- */

export interface TaskFormData {
  taskName: string;
  dueDate?: string;
  dueTime?: string;
  time: Dayjs | null;
  taskType: string;
  priority: string;
  assignedTo: string[];
  notes: string;
  title: string;
}

export interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: TaskFormData) => void;
  contactOwnerIds?: number[];
}

/* ---------- Meeting ---------- */

export interface MeetingUser {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  is_superuser?: boolean;
}

export interface MeetingFormData {
  meetingTitle: string;
  startDate: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  attendees: string[];
  location: string;
  reminder: string;
  notes: string;

}

export interface MeetingFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: MeetingFormData) => void;
  contactOwnerIds?: number[];
}

/* ---------- Call ---------- */

export interface CallFormData {
  connected: string;
  callOutcome: string;
  date: Dayjs | null;
  time: Dayjs | null;
  notes: string;
  duration: number | "";
}
export interface CallFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: CallFormData) => void;
  connectedName?: string;
  connectedPhone?: string;
  onStartCall?: () => void;
  activeCallDuration?: number | "";
  activeCallStatus?: string;
}

/* ---------- Note ---------- */

export interface NoteFormData {
  title: string;
  relatedTo: string;
  notes: string;
}

export interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: NoteFormData) => void;
}

/* ---------- Email ---------- */

export interface EmailFormData {
  recipients: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  recipientEmail?: string;
  emailEndpoint?: string;
  attachments: File[];

}

export interface EmailFormProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: EmailFormData) => void;
  recipientEmail?: string;
  emailEndpoint?: string;
  attachments?: {
    id: number;
    file: string;
    file_name: string;
    file_size?: number | null;
  }[];
}

export type ActivityType =
  | "task"
  | "meeting"
  | "call"
  | "note"
  | "email";