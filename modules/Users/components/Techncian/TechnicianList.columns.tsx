import { Button } from "@/components/ui/button";
//import { Checkbox } from "@/components/ui/checkbox";
import { Technician } from "@/types/technician.types";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { technicianConditionLabel } from "@/constants/condition";
import SuspendTechnician from "./SuspendTechnician";
import EditTechnician from "./EditTechnician";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Technician>[] = [
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-right">Phone</div>,
    cell: ({ row }) => <div className="lowercase">{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "active",
    header: () => <div className="text-right">Active</div>,
    cell: ({ row }) => (
      <div className="lowercase">
        {row.getValue("active") ? "true" : "false"}
      </div>
    ),
  },
  {
    accessorKey: "condition",
    header: () => <div className="text-right">Condition</div>,
    cell: ({ row }) => technicianConditionLabel(row.original.condition),
  },
  {
    id: "actions",
    enableHiding: false,
    // Nothing in the spec deletes a technician — Action#19 suspends instead.
    cell: ({ row }) => (
      <div className="flex justify-end">
        <EditTechnician technician={row.original} />
        <SuspendTechnician technician={row.original} />
      </div>
    ),
  },
];
