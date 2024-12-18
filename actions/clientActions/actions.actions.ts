/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapActions, mapActionToRaw } from "@/mappers/actions.mapper";
import { Action } from "@/types/action.types";

const supabase = supabaseBrowser();

export const getActions = async (): Promise<Action[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error: installationError } = await supabase
        .from("actions")
        .select("*");

      if (installationError) {
        console.error("Error fetching actions:", installationError);
        return reject(installationError.message);
      }

      const mappedData = mapActions(data);

      return resolve(mappedData);
    } catch (error: any) {
      console.error("Error in getPumps:", error);
      reject(error.message);
    }
  });
};

export const addAction = async (props: Partial<Action>): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapActionToRaw(props);

      const { data, error } = await supabase
        .from("actions")
        .insert([
          {
            ...rawData,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding action:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addAction:", error);
      reject(error.message);
    }
  });
};
