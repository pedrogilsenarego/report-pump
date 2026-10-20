import { Pump } from "@/types/pump.types";
import { ColumnDef } from "@tanstack/react-table";
import {
  PUMP_CONDITION_ACTIVE,
  pumpSubTypeLabel,
  pumpTypeLabel,
} from "@/constants/pumpGroup";
import { i18n } from "@/translations/i18n";
import NewPump from "./NewPump";

const t = (key: string) => i18n.t(`pumpGroup.${key}`);

export const columns: ColumnDef<Pump>[] = [
  {
    id: "installation",
    header: () => t("installation"),
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.installations?.name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => t("type"),
    cell: ({ row }) => pumpTypeLabel(row.original.type),
  },
  {
    accessorKey: "subType",
    header: () => t("subType"),
    cell: ({ row }) => pumpSubTypeLabel(row.original.subType),
  },
  {
    id: "pump",
    header: () => t("blockPump"),
    cell: ({ row }) =>
      [row.original.pumpBrand, row.original.pumpModel]
        .filter(Boolean)
        .join(" ") || "—",
  },
  {
    accessorKey: "condition",
    header: () => t("condition"),
    // Only Active is certain; the inactive code is 2 or 0 depending on the sheet.
    cell: ({ row }) =>
      row.original.condition === PUMP_CONDITION_ACTIVE
        ? t("active")
        : row.original.condition,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <NewPump pump={row.original} />,
  },
];
