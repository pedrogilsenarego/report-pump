/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapPumpToRaw } from "@/mappers/pump.mapper";
import { NewPumpType } from "@/modules/Pumps/components/NewPump.validation";
import { Pump } from "@/types/pump.types";

const supabase = supabaseBrowser();

export const getPumps = async ({
  companyId,
}: {
  companyId: string;
}): Promise<Pump[]> => {
  return new Promise(async (resolve, reject) => {
    console.log(companyId);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data: installationData, error: installationError } =
        await supabase
          .from("installations")
          .select("id")
          .eq("company_id", companyId);

      if (installationError) {
        console.error("Error fetching installation IDs:", installationError);
        return reject(installationError.message);
      }

      // Extract installation IDs into an array
      const installationIds = installationData?.map(
        (installation) => installation.id
      );

      if (!installationIds || installationIds.length === 0) {
        // No installations found for the company, return empty
        return resolve([]);
      }

      // Fetch pumps linked to the retrieved installation IDs
      const { data: pumps, error: pumpsError } = await supabase
        .from("pumps")
        .select(
          `*, installations (
            id,
            name,
            company_id
          )`
        )
        .in("installation_id", installationIds);

      if (pumpsError) {
        console.error("Error fetching pumps:", pumpsError);
        return reject(pumpsError.message);
      }

      return resolve(pumps);
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
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapPumpToRaw(props);

      const { data, error } = await supabase
        .from("pumps")
        .insert([
          {
            ...rawData,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding technician:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addPump:", error);
      reject(error.message);
    }
  });
};
