/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapChecklist, mapChecklists } from "@/mappers/checklists.mapper";
import { Checklist, ChecklistSummary } from "@/types/checklist.types";
const supabase = supabaseBrowser();

export const getCheckLists = async (): Promise<Checklist[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase.from("checklists").select(`*,
          checklistactions(*)
          `);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapChecklists(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

export const getCheckList = async (
  checklistId?: number
): Promise<Checklist[]> => {
  return new Promise(async (resolve, reject) => {
    if (!checklistId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("checklists")
        .select(
          `
        *,
        checklistactions (
          id,
          code,
          code_group,
          code_subgroup,
          actions ( * )
        )
      `
        )
        .eq("id", checklistId);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapChecklists(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

/**
 * The check-list list with the size of each imported tree.
 *
 * Only cl_gr hangs off checklists.id directly — cl_sub_gr and cl_action are attached by
 * the composite (checklist_id, code_gr[, code_sub_gr]) FK, which PostgREST cannot embed
 * from the header. So groups come back as an embedded aggregate and the other two levels
 * are tallied from an id-only read.
 */
export const getCheckListSummaries = async (): Promise<ChecklistSummary[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const [checklists, subgroups, actions] = await Promise.all([
    supabase
      .from("checklists")
      .select("*, cl_gr(count)")
      .order("id", { ascending: false }),
    supabase.from("cl_sub_gr").select("checklist_id"),
    supabase.from("cl_action").select("checklist_id"),
  ]);

  const failed = [checklists, subgroups, actions].find((result) => result.error);
  if (failed?.error) {
    console.error("Error fetching check-list summaries:", failed.error);
    throw new Error(failed.error.message);
  }

  const tally = (rows: Array<{ checklist_id: number }> | null) => {
    const counts = new Map<string, number>();
    (rows || []).forEach((row) => {
      const key = `${row.checklist_id}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  };

  const subgroupCounts = tally(subgroups.data);
  const actionCounts = tally(actions.data);

  return (checklists.data || []).map((row: any) => ({
    ...mapChecklist(row),
    // The embedded aggregate arrives as [{ count: n }], or [] when nothing was imported.
    groupCount: row.cl_gr?.[0]?.count || 0,
    subgroupCount: subgroupCounts.get(`${row.id}`) || 0,
    actionCount: actionCounts.get(`${row.id}`) || 0,
  }));
};
