/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer } from "@/lib/supabase/server";
import { NewResponsibleType } from "@/modules/Users/components/Responsible/NewResponsible.validation";

const supabaseAdmin = supabaseAdminServer();

export const addResponsible = async (
  props: NewResponsibleType & { companyId: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();

    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    // Step 1: Attempt to create the user
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
      const safeMessage =
        errorCreatingUser.message || "Failed to create user. Please try again.";
      return { success: false, message: safeMessage }; // Expected error as a return value
    }

    // Step 2: Retrieve the new user's ID
    const newUserId = signUpData?.user?.id;
    if (!newUserId) {
      return { success: false, message: "Failed to retrieve new user ID" };
    }

    // Step 3: Insert responsible-specific data into the "responsables" table
    const { error: errorInsertingTechnician } = await supabaseAdmin
      .from("responsables")
      .insert({
        profile_id: newUserId,
        date_in: props.dateIn,
        date_out: props.dateOut,
        condition: props.condition,
      });

    if (errorInsertingTechnician) {
      console.error("Error inserting technician:", errorInsertingTechnician);
      const safeMessage =
        errorInsertingTechnician.message ||
        "Failed to insert technician data. Please try again.";
      return { success: false, message: safeMessage }; // Expected error as a return value
    }

    return { success: true, message: "Added Responsable successfully." };
  } catch (error: any) {
    console.error("Unexpected error in addResponsible:", error);
    // Unexpected errors are thrown to be handled by global error boundaries
    throw new Error(error.message || "An unexpected error occurred");
  }
};
