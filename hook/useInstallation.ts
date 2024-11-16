"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Installation } from "@/types/installation.types";
import { getInstallations } from "@/actions/clientActions/installation.actions";

export function useInstallations() {
  const user = useUser();
  const companyId = user?.data?.company_id || "";

  return useQuery<Installation[]>({
    queryKey: [QueryKeys.INSTALLATIONS, user],
    queryFn: () => getInstallations({ companyId: companyId }),
    enabled: !!companyId,
  });
}
