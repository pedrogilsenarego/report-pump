import { Checklist } from "@/types/checklist.types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Checklist>[] = [
  {
    accessorKey: "id",
    header: "Checklist Id",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.id || "N/A"}</div>
    ),
  },
  {
    accessorKey: "nfpaEd",
    header: () => <div className="text-right">Nfpa Ed</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("nfpaEd")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Created At</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("createdAt")}</div>
    ),
  },
  {
    accessorKey: "nº Actions",
    header: () => <div className="text-right">Nº Actions</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.original?.actions?.length}</div>
    ),
  },
];
