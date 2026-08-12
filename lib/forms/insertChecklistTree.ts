/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Writes a parsed check-list tree into cl_gr / cl_sub_gr / cl_action / cl_action_values
 * and their _text siblings.
 *
 * Kept apart from the route handler so it can be driven directly by a script
 * (scripts/importTreeCheck.ts) without going through HTTP and an admin session.
 *
 * Inserts top-down, one bulk statement per level. Each level's rows come back with their
 * generated ids so the matching _text rows can point at them; parents are looked up by the
 * spec's composite code, which is unique within a check-list.
 *
 * Throws on the first failure. PostgREST cannot span statements in a transaction, so the
 * caller is responsible for the compensating delete — removing the `checklists` row
 * cascades cl_gr and everything below it.
 */

import { ParsedChecklist } from "./parseChecklistForms";

/**
 * Minimal surface of a supabase-js client, so both the ssr client and the plain one fit.
 * `select` returns a PromiseLike, not a Promise: PostgREST hands back a thenable query
 * builder, which is awaitable but has no .catch / .finally.
 */
export type InsertClient = {
  from: (table: string) => {
    insert: (rows: any[]) => {
      select: (columns: string) => PromiseLike<{ data: any[] | null; error: any }>;
    };
  };
};

const insertAll = async (client: InsertClient, table: string, rows: any[]) => {
  if (!rows.length) return [];

  const { data, error } = await client.from(table).insert(rows).select("*");
  if (error) throw new Error(`${table}: ${error.message}`);

  return data || [];
};

export const insertChecklistTree = async (
  client: InsertClient,
  checklistId: number,
  tree: ParsedChecklist
) => {
  // -- groups ---------------------------------------------------------------
  const groupRows = await insertAll(
    client,
    "cl_gr",
    tree.groups.map((group) => ({ checklist_id: checklistId, code: group.code }))
  );
  const groupId = new Map<number, number>(
    groupRows.map((row: any) => [row.code, row.id])
  );

  await insertAll(
    client,
    "cl_gr_text",
    tree.groups.flatMap((group) =>
      group.texts.map((entry) => ({
        cl_gr_id: groupId.get(group.code),
        language: entry.language,
        text: entry.name,
      }))
    )
  );

  // -- sub-groups -----------------------------------------------------------
  const subgroups = tree.groups.flatMap((group) =>
    group.subGroups.map((subgroup) => ({ group, subgroup }))
  );

  const subgroupRows = await insertAll(
    client,
    "cl_sub_gr",
    subgroups.map(({ group, subgroup }) => ({
      checklist_id: checklistId,
      code_gr: group.code,
      code: subgroup.code,
    }))
  );
  const subgroupId = new Map<string, number>(
    subgroupRows.map((row: any) => [`${row.code_gr}/${row.code}`, row.id])
  );

  await insertAll(
    client,
    "cl_subgr_text",
    subgroups.flatMap(({ group, subgroup }) =>
      subgroup.texts.map((entry) => ({
        cl_sub_gr_id: subgroupId.get(`${group.code}/${subgroup.code}`),
        language: entry.language,
        text: entry.name,
      }))
    )
  );

  // -- actions --------------------------------------------------------------
  const actions = subgroups.flatMap(({ group, subgroup }) =>
    subgroup.actions.map((action) => ({ group, subgroup, action }))
  );

  const actionRows = await insertAll(
    client,
    "cl_action",
    actions.map(({ group, subgroup, action }) => ({
      checklist_id: checklistId,
      code_gr: group.code,
      code_sub_gr: subgroup.code,
      code: action.code,
      period: action.period ?? null,
    }))
  );
  const actionId = new Map<string, number>(
    actionRows.map((row: any) => [
      `${row.code_gr}/${row.code_sub_gr}/${row.code}`,
      row.id,
    ])
  );

  const actionKey = (item: (typeof actions)[number]) =>
    `${item.group.code}/${item.subgroup.code}/${item.action.code}`;

  await insertAll(
    client,
    "cl_action_text",
    actions.flatMap((item) =>
      item.action.texts.map((entry) => ({
        cl_action_id: actionId.get(actionKey(item)),
        language: entry.language,
        type: entry.type ?? null,
        source: entry.source ?? null,
        text: entry.name,
      }))
    )
  );

  // -- measurement slots ----------------------------------------------------
  const values = actions.flatMap((item) =>
    item.action.values.map((value) => ({ item, value }))
  );

  const valueRows = await insertAll(
    client,
    "cl_action_values",
    values.map(({ item, value }) => ({
      cl_action_id: actionId.get(actionKey(item)),
      code: value.code,
    }))
  );
  const valueId = new Map<string, number>(
    valueRows.map((row: any) => [`${row.cl_action_id}/${row.code}`, row.id])
  );

  await insertAll(
    client,
    "cl_values_text",
    values.flatMap(({ item, value }) =>
      value.texts.map((entry) => ({
        cl_action_values_id: valueId.get(
          `${actionId.get(actionKey(item))}/${value.code}`
        ),
        language: entry.language,
        text: entry.name,
      }))
    )
  );
};
