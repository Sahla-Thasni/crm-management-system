 export interface Profile {
  avatar?: string;

  // Lead
  name?: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  email?: string;
  phone?: string;

  // Company
  companyName?: string;
  industry?: string;

  // Deal
  dealName?: string;
  amount?: number;
  stage?: string;

  // Ticket
  ticketName?: string;
  status?: string;
}

export interface AvatarActionSectionProps {
  module: "lead" | "company" | "deal" | "ticket";
  profile: Profile;
  onStatusChange?: (value: string) => void;
}

export const moduleTitles = {
  lead: "Leads",
  company: "Companies",
  deal: "Deals",
  ticket: "Tickets",
};

export const dealStages = [
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export const ticketStatuses = [
  "New",
  "Open",
  "Waiting on contact",
  "Waiting on us",
  "Closed",
];;