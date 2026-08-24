import { ChecklistSummary } from "@/types/checklist.types";
import { i18n } from "@/translations/i18n";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const t = (key: string) => i18n.t(`checklists.${key}`);

/**
 * The group / sub-group / action counts come from the cl_* tree Action#04 imports, not
 * from the legacy `checklistactions` join — a check-list showing 0 groups is one whose
 * import never ran.
 */
export const columns: ColumnDef<ChecklistSummary>[] = [
  {
    id: "expander",
    header: () => null,
    enableHiding: false,
    cell: ({ row }) => (
      <button
        type="button"
        aria-label={t(row.getIsExpanded() ? "collapseTree" : "expandTree")}
        // The tree is only worth opening when there is one.
        disabled={!row.original.groupCount}
        onClick={(event) => {
          event.stopPropagation();
          row.toggleExpanded();
        }}
        className="disabled:opacity-30"
      >
        {row.getIsExpanded() ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>
    ),
  },
  {
    accessorKey: "id",
    header: () => <div>{t("id")}</div>,
    cell: ({ row }) => <div>{row.original.id || "N/A"}</div>,
  },
  {
    accessorKey: "code",
    header: () => <div>{t("reportNr")}</div>,
    cell: ({ row }) => <div>{row.original.code ?? "N/A"}</div>,
  },
  {
    accessorKey: "name",
    header: () => <div>{t("name")}</div>,
    cell: ({ row }) => <div>{row.original.name || "N/A"}</div>,
  },
  {
    accessorKey: "nameResp",
    header: () => <div>{t("nameResp")}</div>,
    cell: ({ row }) => <div>{row.original.nameResp || "N/A"}</div>,
  },
  {
    accessorKey: "nfpaEd",
    header: () => <div>{t("nfpaEd")}</div>,
    cell: ({ row }) => <div>{row.original.nfpaEd || "N/A"}</div>,
  },
  {
    accessorKey: "date",
    header: () => <div>{t("date")}</div>,
    cell: ({ row }) => <div>{row.original.date || "N/A"}</div>,
  },
  {
    accessorKey: "groupCount",
    header: () => <div className="text-right">{t("groups")}</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.groupCount}</div>
    ),
  },
  {
    accessorKey: "subgroupCount",
    header: () => <div className="text-right">{t("subgroups")}</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.subgroupCount}</div>
    ),
  },
  {
    accessorKey: "actionCount",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.actionCount}</div>
    ),
  },
];
