/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";

const supabase = supabaseServer();
export const getSession = async (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getUser();

      if (sessionError || !sessionData?.user) {
        redirect("/auth");
      }

      return resolve(sessionData);
    } catch (error: any) {
      console.error("error", error);
      reject(error.message);
    }
  });
};
