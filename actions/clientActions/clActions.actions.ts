/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapClActions } from "@/mappers/clAction.mapper";
import { ClAction } from "@/types/clAction.types";

const supabase = supabaseBrowser();

/**
 * The template actions for one check-list, with their per-language text and their
 * measurement slots.
 *
 * Replaces the old `checklists -> checklistactions -> actions` read. A check-list imported
 * by Action#04 has cl_action rows and NO checklistactions rows, so the old path returned
 * an empty action list for every imported check-list — the report rendered group and
 * sub-group headings with nothing under them.
 *
 * Like getGroups / getSubgroups there is no write helper: Action#04's import is the only
 * thing that creates these, and the tables are admin-write under RLS.
 */
export const getChecklistActions = async (
  checklistId?: number
): Promise<ClAction[]> => {
  if (!checklistId) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("cl_action")
    .select(
      `
        id,
        checklist_id,
        code_gr,
        code_sub_gr,
        code,
        period,
        pump_type,
        cl_action_text ( language, type, source, text ),
        cl_action_values ( id, code, cl_values_text ( language, text ) )
      `
    )
    .eq("checklist_id", checklistId)
    .order("code_gr", { ascending: true })
    .order("code_sub_gr", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching check-list actions:", error);
    throw new Error(error.message);
  }

  return mapClActions((data || []) as any);
};
