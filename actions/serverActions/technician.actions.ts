/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer } from "@/lib/supabase/server";
import { NewTechnicianType } from "@/modules/Users/components/NewTechnician.validation";

const supabaseAdmin = supabaseAdminServer();

export const addTechnician = async (
  props: NewTechnicianType & { companyId: string }
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      // Step 1: Create the new user
      const { data: signUpData, error: errorCreatingUser } =
        await supabaseAdmin.auth.admin.createUser({
          email: props.email,
          password: props.password,
          email_confirm: true,
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
      const { error: errorInsertingTechnician } = await supabaseAdmin
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
