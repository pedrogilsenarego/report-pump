"use client";

import { useGroups, useSubgroups } from "@/hook/useGroups";
import { i18n } from "@/translations/i18n";
import { localizedName } from "@/utils/localizedName";

/**
 * The imported group / sub-group tree for one check-list, shown under its row.
 *
 * Both reads are scoped to the check-list and only fire once the row is expanded, so the
 * list screen does not pull every tree in the database up front.
 */
export default function ChecklistTree({ checklistId }: { checklistId: number }) {
  const groups = useGroups(checklistId);
  const subgroups = useSubgroups(checklistId);

  if (groups.isLoading || subgroups.isLoading) {
    return (
      <div className="py-2 text-sm opacity-60">{i18n.t("checklists.loadingTree")}</div>
    );
  }

  if (!groups.data?.length) {
    return (
      <div className="py-2 text-sm opacity-60">{i18n.t("checklists.emptyTree")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {groups.data.map((group) => {
        const children = (subgroups.data || []).filter(
          (subgroup) => subgroup.codeGroup === group.code
        );

        return (
          <div key={group.id} className="flex flex-col gap-1">
            <div className="text-sm font-medium">
              {group.code}. {localizedName(group.name)}
            </div>
            {children.length ? (
              <ul className="ml-6 list-disc text-sm opacity-80">
                {children.map((subgroup) => (
                  <li key={subgroup.id}>
                    {group.code}.{subgroup.code} {localizedName(subgroup.name)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ml-6 text-sm opacity-50">
                {i18n.t("checklists.noSubgroups")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
