/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSessionUser, supabaseBrowser } from "@/lib/supabase/browser";
import { mapResponsibles } from "@/mappers/responsible.mapper";
import { Technician } from "@/types/technician.types";

const supabase = supabaseBrowser();

type GetResponsibleProps = {
  companyId: string;
};

export const getReponsible = async ({
  companyId,
}: GetResponsibleProps): Promise<Technician[]> => {
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
          responsables (
            profile_id,
            date_in,
            date_out,
            condition
          )
        `
        )
        .eq("company_id", companyId)
        .in("role", [6, 7]);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      const mappedData = mapResponsibles(data);

      return resolve(mappedData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

