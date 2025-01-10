/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer } from "@/lib/supabase/server";
import { NewResponsibleType } from "@/modules/Users/components/Responsible/NewResponsible.validation";

const supabaseAdmin = supabaseAdminServer();

export const addResponsible = async (
  props: NewResponsibleType & { companyId: string }
): Promise<any> => {
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

      throw new Error(
        "Failed to create user. Please try again. Check if the email is not being used"
      ); // Pass this to the client
    }

    // Step 2: Retrieve the new user's ID from the sign-up response
    const newUserId = signUpData?.user?.id;
    if (!newUserId) {
      throw new Error("Failed to retrieve new user ID");
    }

    // Step 3: Insert technician-specific data into the "responsables" table
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
      throw new Error(
        errorInsertingTechnician.message || "Failed to insert technician data"
      );
    }

    return "Added Responsable";
  } catch (error: any) {
    console.error("Error in addResponsible:", error);
    throw new Error(error.message || "An unexpected error occurred");
  }
};
