import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapChecklists } from "@/mappers/checklists.mapper";
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

      const { data, error } = await supabase.from("checklists").select(`*`);

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
