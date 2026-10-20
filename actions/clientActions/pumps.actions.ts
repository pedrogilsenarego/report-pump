/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionUser, supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapNewPumpToRaw,
  mapPumpToRaw,
  mapPumps,
} from "@/mappers/pump.mapper";
import { NewPumpType } from "@/modules/Pumps/components/NewPump.validation";
import { Pump } from "@/types/pump.types";

const supabase = supabaseBrowser();

export const getPumps = async ({
  companyId,
}: {
  companyId: string;
}): Promise<Pump[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      // One request: `!inner` turns the embed into a join, so filtering on the embedded
      // installation's company_id drops pumps of other companies. This used to be two
      // sequential requests (installation ids, then pumps `in` those ids).
      const { data: pumps, error: pumpsError } = await supabase
        .from("pumps")
        .select(
          `*, installations!inner (
            id,
            name,
            company_id
          )`
        )
        .eq("installations.company_id", companyId);

      if (pumpsError) {
        console.error("Error fetching pumps:", pumpsError);
        return reject(pumpsError.message);
      }

      return resolve(mapPumps(pumps as any));
    } catch (error: any) {
      console.error("Error in getPumps:", error);
      reject(error.message);
    }
  });
};

export const addPump = async (props: NewPumpType): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapNewPumpToRaw(props);

      const { data, error } = await supabase
        .from("pumps")
        .insert([
          {
            ...rawData,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding pump:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addPump:", error);
      reject(error.message);
    }
  });
};

/** Action#25 — Screen#14 edit. Condition is not on the screen, so it is left as stored. */
export const updatePump = async ({
  id,
  values,
}: {
  id: number;
  values: NewPumpType;
}): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { error } = await supabase
        .from("pumps")
        .update(mapPumpToRaw(values))
        .eq("id", id);

      if (error) {
        console.error("Error updating pump:", error);
        return reject(error.message);
      }

      return resolve(id);
    } catch (error: any) {
      console.error("Error in updatePump:", error);
      reject(error.message);
    }
  });
};
