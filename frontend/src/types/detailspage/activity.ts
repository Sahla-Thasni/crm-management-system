export interface ActivityItem {
  id: number;

  type?: string;

  title?: string;
  subject?: string;

  description?: string;
  preview?: string;
  body?: string;
  note?: string;

  assignedTo?: string;
  organizer?: string;
  from?: string;
  author?: string;

  status?: string;
  priority?: string;
  duration?: string;
  phone_call_status?: string;
  // Actual Twilio call duration in seconds
  phone_call_duration?: number | null;
  outcome?: string;

  // Meeting attendees
  attendees?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }[];

  lead?: {
    id: number;
    first_name: string;
    last_name: string;
  };

  // Meeting fields
  startDate?: string;
  startTime?: string;
  endTime?: string;

  createdBy?: {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };

  taskType?: string;
  to?: string;

  date?: string;
  dueDate?: string;
  dueTime?: string;
  meetingDate?: string;

  createdAt?: string;
  isOverdue?: boolean;

  ticket?: string;
  deal?: string;
  action?: string;
  stage?: string;

  completed?: boolean;
  isComplted?: boolean;

  callOutcome?: string | null;
  connectedPhone?: string;

  heading?: string;

  recipients?: string[];
  cc?: string[];
  bcc?: string[];

  subtitle?: string;

  attachments?: {
    id: number;
    file: string;
    file_name: string;
    file_size?: number | null;
  }[];

  location?: string;
  reminder?: string;

  time?: string;
  highlightAuthor?: boolean;
}

// ActivitySearch

export interface SearchActivityProps {
  search: string;
  onSearchChange: (value: string) => void;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

//ActivityTab

export interface ActivityTabsProps {
  tabs?: string[];
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export interface ActivityTab {
  tab: string;
  items: ActivityItem[];
}

export interface ActivitySectionProps {
  activities: ActivityTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;

  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;

  // Convert Lead → Deal
  onConvert?: () => void;
  converting?: boolean;

  onOpenForm?: (
    type: "Notes" | "Emails" | "Calls" | "Tasks" | "Meetings",
  ) => void;

  onTaskComplete?: (taskId: number, completed: boolean) => Promise<void>;

  onCallOutcomeChange?: (callId: number, outcome: string) => Promise<void>;

  onCallDurationChange?: (callId: number, duration: number) => void;
}

export const actionConfig: Record<
  string,
  { title: string; button: string } | null
> = {
  Activity: null,
  Notes: {
    title: "Notes",
    button: "Create Note",
  },
  Emails: {
    title: "Emails",
    button: "Create Email",
  },
  Calls: {
    title: "Calls",
    button: "Create Call",
  },
  Tasks: {
    title: "Tasks",
    button: "Create Task",
  },
  Meetings: {
    title: "Meeting",
    button: "Create Meeting",
  },
};

export interface MeetingUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Meeting {
  id: number;
  title: string;
  note: string;
  start_date: string;
  start_time: string;
  end_time: string;
  attendees: MeetingUser[];
  location: string;
  reminder: string;
  created_at: string;
  created_by?: MeetingUser;
}
