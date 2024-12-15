/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapInterventions,
  mapInterventionToRaw,
} from "@/mappers/interventions.mapper";
import { Intervention, InterventionResult } from "@/types/interventions.types";
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

type NewIntervantionType = {
  data?: any[];
} & Intervention;

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

      const { data: interventionData, error: interventionError } =
        await supabase
          .from("interventions")
          .insert([rawDataIntervention])
          .select("id")
          .single();

      if (interventionError) {
        console.error("Error adding intervention:", interventionError);
        return reject(interventionError.message);
      }

      const interventionId = interventionData.id;

      if (!interventionId) {
        return reject(new Error("Failed to retrieve intervention ID"));
      }

      const interventionChecklistActions = props.data?.map((action) => ({
        intervention_id: interventionId,
        checklistaction_id: action.checklistactionId,
        value: action.value,
      }));

      console.log(interventionChecklistActions);

      const { data: checklistActionData, error: checklistActionError } =
        await supabase
          .from("interventionchecklistactions")
          .insert(interventionChecklistActions);

      if (checklistActionError) {
        console.error(
          "Error adding intervention checklist actions:",
          checklistActionError
        );
        return reject(checklistActionError.message);
      }

      // Resolve with the intervention and checklist action data
      return resolve({
        intervention: interventionData,
        checklistActions: checklistActionData,
      });
    } catch (error: any) {
      console.error("Error in addIntervention:", error);
      reject(error.message);
    }
  });
};

export const getIntervention = async ({
  interventionId,
}: {
  interventionId: number | undefined;
}): Promise<InterventionResult[]> => {
  return new Promise(async (resolve, reject) => {
    if (!interventionId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("interventions")
        .select(
          `*, interventionchecklistactions (*, checklistactions (*, actions(*))) `
        )
        .eq("id", interventionId);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      //const mappedData = mapInterventions(data);

      return resolve(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};
