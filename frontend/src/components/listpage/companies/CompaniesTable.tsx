"use client";

import ListTable from "@/components/listpage/common/ListTable";

type Props = {
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
};

export default function CompaniesTable({ data, onEdit, onDelete }: Props) {
  return (
    <ListTable
      type="companies"
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
