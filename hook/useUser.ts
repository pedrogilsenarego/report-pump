"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
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
