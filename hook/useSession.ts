"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export default function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const supabase = supabaseBrowser();

      const { data } = await supabase.auth.getSession();

      return data;
    },
  });
}
