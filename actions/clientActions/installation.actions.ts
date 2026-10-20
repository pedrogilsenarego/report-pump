/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapInstallations,
  mapInstallationToRaw,
} from "@/mappers/installation.mapper";

import { NewInstallationType } from "@/modules/Instalations/components/NewInstallation.validation";

import { Installation } from "@/types/installation.types";
import { CONDITION_ACTIVE } from "@/constants/condition";

const supabase = supabaseBrowser();

type GetInstallationsProps = {
  companyId: string;
};

export const getInstallations = async ({
  companyId,
}: GetInstallationsProps): Promise<Installation[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("installations")
        .select(
          `*,
          profiles (
            display_name
          )`
        )
        .eq("company_id", companyId);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapInstallations(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

export const addInstallation = async (
  props: NewInstallationType & { companyId: string }
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapInstallationToRaw(props);

      const { data, error } = await supabase
        .from("installations")
        .insert([
          {
            ...rawData,
            // New installations are Active; PopUp#28 is the only thing that changes it.
            condition: CONDITION_ACTIVE,
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

/** PopUp#28 — *Change Condition* on an installation: 1 / 2 / 3. */
export const setInstallationCondition = async ({
  id,
  condition,
}: {
  id: string;
  condition: string;
}): Promise<string> => {
  const { error } = await supabase
    .from("installations")
    .update({ condition })
    .eq("id", id);

  if (error) {
    console.error("Error updating installation condition:", error);
    throw error.message;
  }
  return id;
};
