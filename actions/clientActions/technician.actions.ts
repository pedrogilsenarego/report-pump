/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapTechnicianToRaw } from "@/mappers/technician.mapper";

import { NewTechnicianType } from "@/modules/Users/components/NewTechnician.validation";
import { Profile } from "@/types/profile.types";

const supabase = supabaseBrowser();

type GetTechnicianProps = {
  profileId: string;
};

export const getTechnician = async ({
  profileId,
}: GetTechnicianProps): Promise<Profile[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("technician")
        .select(`*`)
        .eq("technician_profile", profileId);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      return resolve(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

export const addTechnician = async (
  props: NewTechnicianType & { technicianProfile: string }
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapTechnicianToRaw(props);

      const { data, error } = await supabase
        .from("technician")
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
