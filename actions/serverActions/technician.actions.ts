/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabaseAdminServer, supabaseServer } from "@/lib/supabase/server";
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
      // A new technician is Active; Action#19 (Suspend) is the only thing that changes it.
      condition: "1",
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

export type UpdateTechnicianInput = {
  profileId: string;
  name: string;
  phone?: string;
  function?: string;
  certification?: string;
};

/**
 * Action#17 — Screen#11 edit. Email is the technician's login and stays read-only here;
 * Language waits on the 2- vs 3-letter key question (docs/TODO.md item 7).
 *
 * Runs with the service-role client, so the ownership check is done here: the caller's
 * session must belong to the same company as the technician being edited.
 */
export const updateTechnician = async (
  props: UpdateTechnicianInput
): Promise<{ success: boolean; message: string }> => {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  const { data: caller } = await supabaseAdmin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const { data: target } = await supabaseAdmin
    .from("profiles")
    .select("company_id, role")
    .eq("id", props.profileId)
    .single();

  if (
    !caller?.company_id ||
    !target ||
    target.company_id !== caller.company_id ||
    ![4, 5].includes(Number(target.role))
  ) {
    return { success: false, message: "Technician not found" };
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ display_name: props.name, phone: props.phone || null })
    .eq("id", props.profileId);

  if (profileError) {
    console.error("Error updating technician profile:", profileError);
    return { success: false, message: profileError.message };
  }

  // Some technicians predate the `technician` detail table and have no row — update when
  // one exists, otherwise create it Active.
  const detail = {
    function: props.function || null,
    certification: props.certification || null,
  };
  const { data: updated, error: detailError } = await supabaseAdmin
    .from("technician")
    .update(detail)
    .eq("profile_id", props.profileId)
    .select("profile_id");

  if (detailError) {
    console.error("Error updating technician detail:", detailError);
    return { success: false, message: detailError.message };
  }

  if (!updated?.length) {
    const { error: insertError } = await supabaseAdmin
      .from("technician")
      .insert({ profile_id: props.profileId, condition: "1", ...detail });
    if (insertError) {
      console.error("Error inserting technician detail:", insertError);
      return { success: false, message: insertError.message };
    }
  }

  return { success: true, message: "Technician updated" };
};
