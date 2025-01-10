/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer } from "@/lib/supabase/server";
import { NewTechnicianType } from "@/modules/Users/components/Techncian/NewTechnician.validation";

const supabaseAdmin = supabaseAdminServer();

export const addTechnician = async (
  props: NewTechnicianType & { companyId: string }
): Promise<{ success: boolean; message: string }> => {
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
    return {
      success: false,
      message: errorCreatingUser.message || "Failed to create user",
    };
  }

  const newUserId = signUpData?.user?.id;
  if (!newUserId) {
    return { success: false, message: "Failed to retrieve new user ID" };
  }

  // Step 2: Insert data into the "technicians" table
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
    return {
      success: false,
      message:
        errorInsertingTechnician.message || "Failed to insert technician data",
    };
  }

  return { success: true, message: "Added Technician" };
};
