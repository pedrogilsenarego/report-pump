/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapChecklists, mapChecklistToRaw } from "@/mappers/checklists.mapper";
import { NewChecklistType } from "@/modules/Interventions/components/NewChecklist.validation";
import { Checklist } from "@/types/checklist.types";
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

export const addChecklist = async (props: NewChecklistType): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapChecklistToRaw(props);

      const { data, error } = await supabase
        .from("checklists")
        .insert([
          {
            ...rawData,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding checklist:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addTechnician:", error);
      reject(error.message);
    }
  });
};
