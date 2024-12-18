import { periodValues } from "@/constants/actions";
import { Action } from "@/types/action.types";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Action>[] = [
  {
    accessorKey: "id",
    header: "Action Id",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.id || "N/A"}</div>
    ),
  },
  {
    accessorKey: "period",
    header: () => <div className="text-right">Period</div>,
    cell: ({ row }) => (
      <div className="lowercase">
        {periodValues[parseInt(row.getValue("period"))]}
      </div>
    ),
  },

  {
    accessorKey: "description",
    header: () => <div className="text-right">Description</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Created At</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("createdAt")}</div>
    ),
  },
];
