/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapInterventions,
  mapInterventionToRaw,
} from "@/mappers/interventions.mapper";
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

type NewIntervantionType = {} & Intervention;

export const addIntervention = async (
  props: NewIntervantionType
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawDataIntervention = mapInterventionToRaw({
        userId: user.id,
        installationId: props.installationId,
        checklistId: props.checklistId,
      });

      const { data, error } = await supabase
        .from("interventions")
        .insert([
          {
            ...rawDataIntervention,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding technician:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addTechnician:", error);
      reject(error.message);
    }
  });
};
