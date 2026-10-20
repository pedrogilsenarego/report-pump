"use server";
import { supabaseAdminServer, supabaseServer } from "@/lib/supabase/server";

/**
 * The logged-in customer's or provider's own registration — SF#210 *Edit Record*
 * (customer, Screen#09) and SF#131 *Edit Registration* (provider, Screen#08 / Action#13).
 *
 * Both actions resolve the company from the caller's session and never take a company id
 * from the client, so a user can only ever read or change their own registration. They run
 * with the service-role client for that reason: the check is here, not in RLS.
 *
 * The contact email is not editable — it is the address the registration was approved
 * under, and the login.
 */

export type Registration = {
  companyName: string;
  address: string;
  country: string;
  defaultLang: string;
  phone: string;
  email: string;
  responsibleName: string;
};

const callerProfile = async () => {
  const {
    data: { user },
  } = await supabaseServer().auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdminServer()
    .from("profiles")
    .select("id, company_id, display_name, role")
    .eq("id", user.id)
    .single();

  // Only the company's own account (customer 2 / provider 3) edits the registration.
  if (!data?.company_id || ![2, 3].includes(Number(data.role))) return null;
  return data;
};

export const getMyRegistration = async (): Promise<Registration | null> => {
  const profile = await callerProfile();
  if (!profile) return null;

  const { data: company } = await supabaseAdminServer()
    .from("companies")
    .select("company_name, address, country, default_language, phone, email")
    .eq("id", profile.company_id)
    .single();

  if (!company) return null;
  return {
    companyName: company.company_name ?? "",
    address: company.address ?? "",
    country: company.country ?? "",
    defaultLang: company.default_language ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    responsibleName: profile.display_name ?? "",
  };
};

export const updateMyRegistration = async (
  values: Omit<Registration, "email">
): Promise<{ success: boolean; message: string }> => {
  const profile = await callerProfile();
  if (!profile) return { success: false, message: "Not allowed" };

  const admin = supabaseAdminServer();

  const { error: companyError } = await admin
    .from("companies")
    .update({
      company_name: values.companyName,
      address: values.address,
      country: values.country,
      default_language: values.defaultLang,
      phone: values.phone || null,
    })
    .eq("id", profile.company_id);

  if (companyError) {
    console.error("Error updating registration:", companyError);
    return { success: false, message: companyError.message };
  }

  // The Responsable Name (SF#013 / #097) lives on the account's profile.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ display_name: values.responsibleName, phone: values.phone || null })
    .eq("id", profile.id);

  if (profileError) {
    console.error("Error updating responsable name:", profileError);
    return { success: false, message: profileError.message };
  }

  return { success: true, message: "Registration updated" };
};
