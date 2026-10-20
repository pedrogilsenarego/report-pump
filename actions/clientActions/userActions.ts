/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouterKeys } from "@/constants/router";
import { getSessionUser, supabaseBrowser } from "@/lib/supabase/browser";

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
      } = await getSessionUser();
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
  address,

  phone,
  defaultLang,
  companyId,
  country,
}: {
  email: string;
  password: string;
  username: string;
  role: string;
  country: string;
  address: string;
  companyId: string;
  phone?: string;
  defaultLang: string;
}): Promise<string> => {
  console.log("creatingUser");

  return new Promise(async (resolve, reject) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,

        options: {
          emailRedirectTo: `${origin}${RouterKeys.HOME}`,
          //emailRedirectTo: `${origin}/auth/callback`,
          data: {
            displayName: username,
            role: parseInt(role),
            address,
            phone,
            country,
            defaultLang,
            companyId,
          },
        },
      });

      if (error) {
        reject({ error: error.message, companyId });
      }

      return resolve("Welcome to Equitotal enjoy");
    } catch (error: any) {
      console.error("error", { error: error.message, companyId });
      reject({ error: error.message, companyId });
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

export const acceptUserPending = async ({
  targetUserId,
  companyId,
}: {
  targetUserId: string;
  companyId: string;
}): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      // Step 2: Update the invitation to mark it as accepted
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ active: true })
        .eq("id", targetUserId);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
        return reject(updateError);
      }

      const { error: updateErrorCompany } = await supabase
        .from("companies")
        .update({ active: true })
        .eq("id", companyId);

      if (updateErrorCompany) {
        console.error("Error updating invitation:", updateErrorCompany);
        return reject(updateErrorCompany);
      }

      // Action#03 / #08: record who validated and when. Separate and best-effort so that
      // approval keeps working before 20261020_company_validation.sql is applied.
      const { error: validationError } = await supabase
        .from("companies")
        .update({
          validated_by: user.id,
          date_validated: new Date().toISOString(),
        })
        .eq("id", companyId);

      if (validationError) {
        console.error(
          "Could not record Validated_By / Date_Validated — is the 20261020 migration applied?",
          validationError
        );
      }

      return resolve("User Accepted");
    } catch (error: any) {
      console.error("Unexpected error occurred:", error);
      reject(error.message);
    }
  });
};

export const validateUser = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { user },
      } = await getSessionUser();

      if (!user) {
        return reject(new Error("User not authenticated"));
      }

      // Step 2: Update the invitation to mark it as accepted
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ active: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
        return reject(updateError);
      }

      return resolve("User Validated");
    } catch (error: any) {
      console.error("Unexpected error occurred:", error);
      reject(error.message);
    }
  });
};

/**
 * Change password (P4) from the menu: the old password is checked first, as the spec's
 * "Input Old Password -> Validate Password" step, by re-authenticating with it. Supabase's
 * updateUser alone would accept any logged-in session without the old one.
 */
export const changePassword = async ({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}): Promise<string> => {
  const {
    data: { user },
  } = await getSessionUser();

  if (!user?.email) throw "User not authenticated";

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });
  if (signInError) throw "WRONG_PASSWORD";

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error.message;

  return "Password changed";
};
