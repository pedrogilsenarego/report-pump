/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapInstallations,
  mapInstallationToRaw,
} from "@/mappers/installation.mapper";

import { NewInstallationType } from "@/modules/Instalations/components/NewInstallation.validation";

import { Installation } from "@/types/installation.types";

const supabase = supabaseBrowser();

type GetInstallationsProps = {
  profileId: string;
};

export const getInstallations = async ({
  profileId,
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
        .select(`*`)
        .eq("profile_id", profileId);

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
  props: NewInstallationType & { profileId: string }
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
      console.log(rawData);

      const { data, error } = await supabase
        .from("installations")
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
      console.error("Error in addTechnician:", error);
      reject(error.message);
    }
  });
};
