import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapInterventions } from "@/mappers/interventions.mapper";
import { Intervention } from "@/types/interventions.types";
const supabase = supabaseBrowser();

export const getInterventions = async (): Promise<Intervention[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("interventions")
        .select(`*`)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapInterventions(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};
