"use client";

import ListTable from "@/components/listpage/common/ListTable";

type TicketOwner = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type Ticket = {
  id: number;
  ticket_name: string;
  description: string;
  ticket_status: string;
  source: string;
  priority: string;
  created_at: string;

  associated_deal_details?: {
    id: number;
    deal_name: string;
  };

  ticket_owner_details?: TicketOwner[];
};


type Props = {
  data: Ticket[];
  onEdit?: (row: Ticket) => void;
  onDelete?: (row: Ticket) => void;
};

export default function TicketsTable({
  data,
  onEdit,
  onDelete,
}: Props) {
  const formattedTickets = data.map((ticket) => {
    const ticketOwner =
      ticket.ticket_owner_details
        ?.map((owner) =>
          `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim()
        )
        .filter(Boolean)
        .join(", ") || "-";

    return {
      id: ticket.id,

      profile: {
        ticketName: ticket.ticket_name || "-",

        dealName:
          ticket.associated_deal_details?.deal_name || "-",

        status: ticket.ticket_status || "-",

        priority: ticket.priority || "-",

        source: ticket.source || "-",

        ticketOwner,

        ticketDescription: ticket.description || "",

        avatar: "",

        createdDate: ticket.created_at || "-",
      },
    };
  });

  return (
    <ListTable
      type="tickets"
      data={formattedTickets}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}