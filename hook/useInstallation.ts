"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Installation } from "@/types/installation.types";
import { getInstallations } from "@/actions/clientActions/installation.actions";

export function useInstallations() {
  const user = useUser();
  const profileId = user?.data?.id || "";

  return useQuery<Installation[]>({
    queryKey: [QueryKeys.INSTALLATIONS],
    queryFn: () => getInstallations({ profileId: profileId }),
    enabled: !!profileId,
  });
}
