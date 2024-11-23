/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapPumpToRaw } from "@/mappers/pump.mapper";
import { NewPumpType } from "@/modules/Pumps/components/NewPump.validation";

const supabase = supabaseBrowser();

export const addPump = async (props: NewPumpType): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      const rawData = mapPumpToRaw(props);

      const { data, error } = await supabase
        .from("pumps")
        .insert([
          {
            ...rawData,
          },
        ])
        .single();

      if (error) {
        console.error("Error adding technician:", error);
        return reject(error.message);
      }

      return resolve(data);
    } catch (error: any) {
      console.error("Error in addPump:", error);
      reject(error.message);
    }
  });
};
