/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapCompanyToRaw } from "@/mappers/companies.mapper";

const supabase = supabaseBrowser();

export const addCompany = async ({
  email,
  role,
  address,
  nameCompany,
  phone,
  defaultLang,
  country,
}: {
  email: string;
  role: string;
  country: string;
  address: string;
  nameCompany: string;
  phone?: string;
  defaultLang: string;
}): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const rawData = mapCompanyToRaw({
        email,
        role,
        address,
        nameCompany,
        phone,
        defaultLang,
        country,
      });
      console.log(rawData);

      const { data, error } = await supabase
        .from("companies")
        .insert([{ ...rawData }])
        .select("id") // Only return the "id" field
        .single();

      if (error) {
        console.error("Error adding company:", error);
        return reject(error.message);
      }

      if (data && data.id) {
        return resolve({
          companyId: data.id,
          email,
          role,
          address,
          nameCompany,
          phone,
          defaultLang,
          country,
        });
      } else {
        return reject("Failed to retrieve company ID");
      }
    } catch (error: any) {
      console.error("Error in addCompany:", error);
      reject(error.message);
    }
  });
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyId);

      if (error) {
        console.error("Error deleting company:", error);
        return reject(error.message);
      }
      console.log("company deleted");
      resolve();
    } catch (error: any) {
      console.error("Error in deleteCompany:", error);
      reject(error.message);
    }
  });
};
