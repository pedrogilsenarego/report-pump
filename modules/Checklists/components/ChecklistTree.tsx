"use client";

import { periodLabel } from "@/constants/actions";
import { useGroups, useSubgroups } from "@/hook/useGroups";
import { useChecklistActions } from "@/hook/useInterventions";
import { i18n } from "@/translations/i18n";
import { localizedName } from "@/utils/localizedName";

/**
 * The imported group / sub-group / action tree for one check-list, shown under its row.
 *
 * All three reads are scoped to the check-list and only fire once the row is expanded, so
 * the list screen does not pull every tree in the database up front.
 *
 * The action level is what the admin actually needs to inspect after an Action#04 import:
 * the row counter says "9 actions", and this is where you see WHICH nine, with the
 * periodicity, the NFPA-25 clause each one cites and its measurement slots.
 */
export default function ChecklistTree({ checklistId }: { checklistId: number }) {
  const groups = useGroups(checklistId);
  const subgroups = useSubgroups(checklistId);
  const actions = useChecklistActions(checklistId);

  if (groups.isLoading || subgroups.isLoading || actions.isLoading) {
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
              <ul className="ml-6 flex flex-col gap-2 text-sm">
                {children.map((subgroup) => {
                  // cl_action carries both codes, so an action is placed by
                  // (codeGroup, codeSubgroup) — a sub-group 1 exists under every group.
                  const rows = (actions.data || []).filter(
                    (action) =>
                      action.codeGroup === group.code &&
                      action.codeSubgroup === subgroup.code
                  );

                  return (
                    <li key={subgroup.id} className="flex flex-col gap-1">
                      <div className="opacity-80">
                        {group.code}.{subgroup.code} {localizedName(subgroup.name)}
                      </div>

                      {rows.length ? (
                        <ul className="ml-4 flex flex-col gap-1">
                          {rows.map((action) => (
                            <li key={action.id} className="flex flex-col">
                              <div>
                                <span className="opacity-60">
                                  {group.code}.{subgroup.code}.{action.code}
                                </span>{" "}
                                {localizedName(action.name)}
                              </div>
                              <div className="flex flex-wrap gap-x-3 text-xs opacity-60">
                                {action.period ? (
                                  <span>{periodLabel(action.period)}</span>
                                ) : null}
                                {localizedName(action.source) ? (
                                  <span>{localizedName(action.source)}</span>
                                ) : null}
                                {action.pumpType ? (
                                  <span>
                                    {i18n.t("checklists.pumpType", {
                                      type: action.pumpType,
                                    })}
                                  </span>
                                ) : null}
                                {action.values.length ? (
                                  <span>
                                    {i18n.t("checklists.measurements", {
                                      count: action.values.length,
                                    })}
                                  </span>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="ml-4 text-xs opacity-50">
                          {i18n.t("checklists.noActions")}
                        </div>
                      )}
                    </li>
                  );
                })}
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
