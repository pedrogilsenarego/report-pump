/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionUser, supabaseBrowser } from "@/lib/supabase/browser";

import { mapTechnicians } from "@/mappers/technician.mapper";
import { Technician } from "@/types/technician.types";

const supabase = supabaseBrowser();

type GetTechnicianProps = {
  companyId: string;
};

export const getTechnician = async ({
  companyId,
}: GetTechnicianProps): Promise<Technician[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          technician (
            profile_id,
            function,
            certification,
            condition
          )
        `
        )
        .eq("company_id", companyId)
        .in("role", [4, 5]);

      console.log(data);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapTechnicians(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

/**
 * Action#19 — Screen#12 *Suspend* sets `TECHNICIAN_CUST:Condition = 2`. The condition lives
 * on the `technician` detail row, keyed by the technician's profile id.
 */
export const setTechnicianCondition = async ({
  profileId,
  condition,
}: {
  profileId: string;
  condition: string;
}): Promise<string> => {
  const { error } = await supabase
    .from("technician")
    .update({ condition })
    .eq("profile_id", profileId);

  if (error) {
    console.error("Error updating technician condition:", error);
    throw error.message;
  }
  return profileId;
};
