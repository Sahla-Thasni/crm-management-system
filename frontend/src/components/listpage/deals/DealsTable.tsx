"use client";

import ListTable from "@/components/listpage/common/ListTable";
import type { Deal } from "@/store/slices/dealsSlice";

type Props = {
  data: any[];
  onEdit?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
};

export default function DealsTable({ data,onEdit,
  onDelete, }: Props) {
  console.log("DEALS TABLE DATA:", data);
  return <ListTable
      type="deals"
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
    />;
}