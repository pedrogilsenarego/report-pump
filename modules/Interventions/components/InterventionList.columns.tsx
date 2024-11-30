import { Intervention } from "@/types/interventions.types";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Intervention>[] = [
  {
    accessorKey: "id",
    header: "Intervention Id",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.id || "N/A"}</div>
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
