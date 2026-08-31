/**
 * The report layout the spec asks for is group -> sub-group -> action, so actions have to
 * nest two levels deep, not one. Codes sort numerically: string keys would put 10 before 2.
 *
 * Generic over the row type: the same nesting drives the New Intervention form (rows are
 * `ClAction` template rows) and the finished report (rows are `InterventionResult`
 * answers). Both carry the composite codes, which is all the grouping needs.
 */

/** The minimum a row needs to be placed in the group -> sub-group tree. */
export type GroupedRow = {
  codeGroup?: number | string | null;
  codeSubgroup?: number | string | null;
  code?: number | string | null;
};

export type GroupedActions<T extends GroupedRow> = Array<{
  codeGroup: number | string;
  subgroups: Array<{
    codeSubgroup: number | string;
    actions: T[];
  }>;
}>;

const byCode = (a: number | string, b: number | string) =>
  Number(a) - Number(b) || String(a).localeCompare(String(b));

export const groupByGroupAndSubgroup = <T extends GroupedRow>(
  data: T[]
): GroupedActions<T> => {
  const groups = new Map<number | string, Map<number | string, T[]>>();

  (data || []).forEach((action) => {
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
          actions: actions
            .slice()
            .sort((a, b) => byCode(a.code ?? 0, b.code ?? 0)),
        })),
    }));
};

/**
 * Which actions belong on a round of the given periodicity.
 *
 * PERIODICITY codes ascend from most to least frequent (1 Weekly, 2 Monthly, 3 Quarterly,
 * ... 8 5-Annually — Table_Peridiocity.xlsx). A monthly round therefore has to include the
 * weekly checks as well, so the test is `action.period <= period`, not `>=`.
 * The previous `>=` kept exactly the wrong half of the list.
 */
export const isDueForPeriod = (
  actionPeriod: number | undefined,
  period: number | undefined
): boolean => {
  if (!period) return true;
  if (actionPeriod == null) return true;
  return actionPeriod <= period;
};

/**
 * Whether an action applies to the pump group being inspected.
 *
 * `CL_ACTION.Pump_Type` is the per-action filter and holds a `PUMP_GROUP.Type` (J/E/D) —
 * sheet 5/6 defines `xType = PUMP_GROUP:Type` immediately before generating the report that
 * loops CL_ACTION. An action with no Pump_Type applies to every group.
 *
 * Deliberately permissive: `pumps.type` is still a free-text field (backlog item 3 has not
 * modelled PUMP_GROUP properly yet) and `#Tipos Sub-Grupo NP.xlsx` implies four categories
 * against PUMP_GROUP.Type's three, which the client has not resolved. Filtering an action
 * OUT wrongly would silently drop a required check from a report, so anything we cannot
 * confidently exclude is kept.
 */
export const appliesToPumpType = (
  actionPumpType: string | undefined,
  pumpType: string | undefined
): boolean => {
  const action = actionPumpType?.trim();
  if (!action) return true;
  if (!pumpType?.trim()) return true;
  return action.toUpperCase() === pumpType.trim().toUpperCase();
};
