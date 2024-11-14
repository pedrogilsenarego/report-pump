/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapResponsibles } from "@/mappers/responsible.mapper";
import { NewTechnicianType } from "@/modules/Users/components/Techncian/NewTechnician.validation";
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
      } = await supabase.auth.getUser();

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

      console.log(data);

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

export const addTechnician = async (
  props: NewTechnicianType & { companyId: string }
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      // Step 1: Create the new user
      const { data: signUpData, error: errorCreatingUser } =
        await supabase.auth.admin.createUser({
          email: props.email,
          password: props.password,
          user_metadata: {
            displayName: props.name,
            role: parseInt(props.role),
            phone: props.phone,
            companyId: props.companyId,
          },
        });

      if (errorCreatingUser) {
        return reject(errorCreatingUser.message);
      }

      // Step 2: Retrieve the new user's ID from the sign-up response
      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        return reject(new Error("Failed to retrieve new user ID"));
      }

      // Step 3: Insert technician-specific data into the technicians table
      const { error: errorInsertingTechnician } = await supabase
        .from("technician")
        .insert({
          profile_id: newUserId,
          function: props.function,
          certification: props.certification,
          condition: props.condition,
        });

      if (errorInsertingTechnician) {
        return reject(errorInsertingTechnician.message);
      }

      return resolve("Added Technician");
    } catch (error: any) {
      console.error("Error in addTechnician:", error);
      reject(error.message);
    }
  });
};
