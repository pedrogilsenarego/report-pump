"use client";

import { getProfilesPending } from "@/actions/clientActions/profile.actions";
import { QueryKeys } from "@/constants/queryKeys";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery<User>({
    queryKey: [QueryKeys.USER],
    queryFn: async () => {
      const supabase = supabaseBrowser();

      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
        return user;
      }
    },
  });
}

export function useUsersPending() {
  return useQuery<User[]>({
    queryKey: [QueryKeys.USERS_PENDING],
    queryFn: getProfilesPending,
  });
}
