import { Button } from "@/components/ui/button";
//import { Checkbox } from "@/components/ui/checkbox";
import { Installation } from "@/types/installation.types";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { installationConditionLabel } from "@/constants/condition";
import ChangeInstallationCondition from "./ChangeInstallationCondition";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Installation>[] = [
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
    accessorKey: "responsibleName",
    header: "Responsible",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("responsibleName")}</div>
    ),
  },
  {
    accessorKey: "area",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Area
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("area")}</div>,
  },
  {
    accessorKey: "address",
    header: () => <div className="text-right">Address</div>,
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("address")}</div>
    ),
  },
  {
    accessorKey: "condition",
    header: () => <div className="text-right">Condition</div>,
    cell: ({ row }) => installationConditionLabel(row.original.condition),
  },
  {
    id: "actions",
    enableHiding: false,
    // Nothing in the spec deletes an installation — "Deleted" is Condition 3 (PopUp#28).
    cell: ({ row }) => (
      <ChangeInstallationCondition installation={row.original} />
    ),
  },
];
