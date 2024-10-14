import { supabaseBrowser } from "@/lib/supabase/browser";
import { mapProfile, mapProfiles } from "@/mappers/profile.mapper";
import { Profile } from "@/types/profile.types";

const supabase = supabaseBrowser();

export const getProfile = async (userId: string): Promise<Profile> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, display_name, image_url, last_activity`)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      // Resolve with the user data
      return resolve(mapProfile(data));
    } catch (error: any) {
      console.error("Error in getUserDataById:", error);
      reject(error.message);
    }
  });
};

export const getProfiles = async (userIds: string[]): Promise<Profile[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id, display_name, image_url, last_activity`)
        .in("id", userIds);

      if (error) {
        console.error("Error fetching user data:", error);
        return reject(error.message);
      }

      return resolve(mapProfiles(data));
    } catch (error: any) {
      console.error("Error in getProfiles:", error);
      reject(error.message);
    }
  });
};

export const updateLastActivity = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      // Check if user is authenticated
      if (authError || !user) {
        console.error("Error fetching authenticated user:", authError);
        return reject(new Error("User not authenticated"));
      }

      // Update the user's last_activity
      const { error } = await supabase
        .from("profiles")
        .update({ last_activity: new Date().toISOString() }) // Update with current timestamp
        .eq("id", user.id);

      if (error) {
        console.error("Error updating last_activity:", error);
        return reject(error.message);
      }

      // Resolve if the update is successful
      resolve();
    } catch (error: any) {
      console.error("Error in updateLastActivity:", error);
      reject(error.message);
    }
  });
};
