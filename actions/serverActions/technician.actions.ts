/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer } from "@/lib/supabase/server";
import { NewTechnicianType } from "@/modules/Users/components/Techncian/NewTechnician.validation";

const supabaseAdmin = supabaseAdminServer();

export const addTechnician = async (
  props: NewTechnicianType & { companyId: string }
): Promise<string> => {
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
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
      console.error("Error creating user:", errorCreatingUser);
      throw new Error(errorCreatingUser.message || "Failed to create user");
    }

    // Step 2: Retrieve the new user's ID from the sign-up response
    const newUserId = signUpData?.user?.id;
    if (!newUserId) {
      throw new Error("Failed to retrieve new user ID");
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
      console.error("Error inserting technician:", errorInsertingTechnician);
      throw new Error(
        errorInsertingTechnician.message || "Failed to insert technician data"
      );
    }

    return "Added Technician";
  } catch (error: any) {
    console.error("Error in addTechnician:", error);
    throw new Error(error.message || "An unexpected error occurred");
  }
};
