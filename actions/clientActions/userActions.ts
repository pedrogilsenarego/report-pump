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
  role,
}: {
  email: string;
  password: string;
  username: string;
  role: string;
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
            role: parseInt(role),
          },
        },
      });

      if (error) {
        reject(error.message);
      }

      return resolve("Welcome to Equitotal enjoy");
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
