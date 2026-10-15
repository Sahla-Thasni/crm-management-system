"use client";

import ListTable from "@/components/listpage/common/ListTable";

interface LeadsTableProps {
  data: any[];
  onEdit?: (lead: any) => void;
  onDelete?: (lead: any) => void;
}

export default function LeadsTable({
  data,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  return (
    <ListTable
      type="leads"
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}