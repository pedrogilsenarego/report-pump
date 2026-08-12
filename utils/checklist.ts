import { ChecklistAction } from "@/types/checklist.types";

export const groupByCodeGroup = (data: ChecklistAction[]) => {
  return data.reduce(
    (acc: Record<string, ChecklistAction[]>, item: ChecklistAction) => {
      const groupKey = item.codeGroup || "Ungrouped";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {}
  );
};

/**
 * The report layout the spec asks for is group -> sub-group -> action, so actions have to
 * nest two levels deep, not one. Codes sort numerically: string keys would put 10 before 2.
 */
export type GroupedActions = Array<{
  codeGroup: number | string;
  subgroups: Array<{
    codeSubgroup: number | string;
    actions: ChecklistAction[];
  }>;
}>;

const byCode = (a: number | string, b: number | string) =>
  Number(a) - Number(b) || String(a).localeCompare(String(b));

export const groupByGroupAndSubgroup = (
  data: ChecklistAction[]
): GroupedActions => {
  const groups = new Map<number | string, Map<number | string, ChecklistAction[]>>();

  data.forEach((action) => {
    const groupKey = action.codeGroup ?? "Ungrouped";
    const subgroupKey = action.codeSubgroup ?? "Ungrouped";

    if (!groups.has(groupKey)) groups.set(groupKey, new Map());
    const subgroups = groups.get(groupKey)!;
    if (!subgroups.has(subgroupKey)) subgroups.set(subgroupKey, []);
    subgroups.get(subgroupKey)!.push(action);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => byCode(a, b))
    .map(([codeGroup, subgroups]) => ({
      codeGroup,
      subgroups: Array.from(subgroups.entries())
        .sort(([a], [b]) => byCode(a, b))
        .map(([codeSubgroup, actions]) => ({
          codeSubgroup,
          actions: actions.slice().sort((a, b) => byCode(a.code, b.code)),
        })),
    }));
};
