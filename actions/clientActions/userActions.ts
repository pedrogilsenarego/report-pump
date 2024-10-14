/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";

const supabase = supabaseBrowser();

export const recoverPassword = async ({
  email,
}: {
  email: string;
}): Promise<string> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return "Password recovery email sent successfully. Please check your inbox.";
  } catch (error) {
    console.error("Error recovering password:", error);
    throw error;
  }
};

export const updatePassword = async ({
  password,
}: {
  password: string;
}): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        reject("no session");
      }
      const { data: resetData, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        reject(error.message);
      }

      resolve(resetData);
    } catch (error) {
      console.error("Error recovering password:", error);
      throw error;
    }
  });
};

export const signupUser = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}): Promise<string> => {
  console.log("creatingUser");
  return new Promise(async (resolve, reject) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,

        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            displayName: username,
          },
        },
      });

      if (error) {
        reject(error.message);
      }

      return resolve("Welcome to interseed enjoy");
    } catch (error: any) {
      console.error("error", error);
      reject(error.message);
    }
  });
};

export const signinUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<string> => {
  console.log("loggingUser");
  return new Promise(async (resolve, reject) => {
    try {
      const session = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (session.error) {
        reject(session?.error?.message || "Could not autenticate user");
      }
      if (session.data.user) {
        // Fetch user data from Supabase table

        return resolve(session.data.user.user_metadata.displayName);
      } else {
        reject("User data not found.");
      }
    } catch (error) {
      console.error("error", error);
      reject(error);
    }
  });
};

export const searchUsersByEmail = async (
  searchTerm: string,
  channelId?: string
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Get the authenticated user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      let userIdsInChannel: string[] = [];

      // Step 2: Get the list of user IDs in the specified channel, if provided
      if (channelId) {
        const { data: userChannelData, error: userChannelError } =
          await supabase
            .from("user_channel_roles")
            .select("user_id")
            .eq("channel_id", channelId);

        if (userChannelError) {
          console.error("Error fetching users in channel:", userChannelError);
          return reject(userChannelError.message);
        }

        userIdsInChannel = userChannelData.map((role: any) => role.user_id);
      }

      // Step 3: Add the authenticated user's ID to the list of user IDs to exclude
      userIdsInChannel.push(user.id);

      // Step 4: Build the query to search users by email
      let query = supabase
        .from("profiles")
        .select("*")
        .ilike("email", `%${searchTerm}%`)
        .limit(10);

      // Step 5: Exclude users in the channel and the authenticated user from the results
      if (userIdsInChannel.length > 0) {
        query = query.not("id", "in", `(${userIdsInChannel.join(",")})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        return reject(error.message);
      }

      // Step 6: Resolve with the filtered list of users
      return resolve(data);
    } catch (error: any) {
      console.error("Error in searchUsersByEmail:", error);
      reject(error.message);
    }
  });
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error.message);
      throw new Error(error.message);
    }
    console.log("User logged out successfully");
  } catch (error: any) {
    console.error("Error in logoutUser:", error.message);
    throw new Error(error.message);
  }
};
