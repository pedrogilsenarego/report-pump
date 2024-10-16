import { supabaseBrowser } from "@/lib/supabase/browser";
import { User } from "@/types/user.types";

const supabase = supabaseBrowser();

export const getProfilesPending = async (): Promise<User[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("active", false);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      return resolve(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};
