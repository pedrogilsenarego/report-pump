/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapGroups, mapSubgroups } from "@/mappers/groups.mapper";
import { Group, Subgroup } from "@/types/group.types";

const supabase = supabaseBrowser();

/**
 * Groups / sub-groups are per check-list, so every read is scoped to one.
 * There are no write helpers: Action#04's import is the only thing that creates them
 * (see docs/checklist-actions-import.md), and the tables are admin-write under RLS.
 */

export const getGroups = async (checklistId: number): Promise<Group[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("cl_gr")
        .select("*, cl_gr_text (language, text)")
        .eq("checklist_id", checklistId)
        .order("code", { ascending: true });

      if (error) {
        console.error("Error fetching groups:", error);
        return reject(error.message);
      }

      return resolve(mapGroups(data));
    } catch (error: any) {
      console.error("Error in getGroups:", error);
      reject(error.message);
    }
  });
};

export const getSubgroups = async (checklistId: number): Promise<Subgroup[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("cl_sub_gr")
        .select("*, cl_subgr_text (language, text)")
        .eq("checklist_id", checklistId)
        .order("code_gr", { ascending: true })
        .order("code", { ascending: true });

      if (error) {
        console.error("Error fetching subgroups:", error);
        return reject(error.message);
      }

      return resolve(mapSubgroups(data));
    } catch (error: any) {
      console.error("Error in getSubgroups:", error);
      reject(error.message);
    }
  });
};
