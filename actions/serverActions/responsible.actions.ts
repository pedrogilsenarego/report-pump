/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer, supabaseServer } from "@/lib/supabase/server";
import { NewResponsibleType } from "@/modules/Users/components/Responsible/NewResponsible.validation";

const supabaseAdmin = supabaseAdminServer();

/** Customers (2) create responsables with role 6, providers (3) with role 7. */
const RESPONSIBLE_ROLE_FOR: Record<number, number> = { 2: 6, 3: 7 };

/**
 * Runs with the service-role key, so the company and the new account's role come from the
 * CALLER's profile, never the request body — see the same note on addTechnician.
 */
export const addResponsible = async (
  props: NewResponsibleType & { companyId?: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const {
      data: { user },
    } = await supabaseServer().auth.getUser();

    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const { data: caller } = await supabaseAdmin
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single();

    const role = RESPONSIBLE_ROLE_FOR[Number(caller?.role)];
    if (!caller?.company_id || !role) {
      return { success: false, message: "Not allowed" };
    }

    // Step 1: Attempt to create the user
    const { data: signUpData, error: errorCreatingUser } =
      await supabaseAdmin.auth.admin.createUser({
        email: props.email,
        password: props.password,
        email_confirm: true,
        user_metadata: {
          displayName: props.name,
          role,
          phone: props.phone,
          companyId: caller.company_id,
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
