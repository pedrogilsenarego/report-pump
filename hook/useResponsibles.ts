"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Responsible } from "@/types/responsible.types";
import { getReponsible } from "@/actions/clientActions/responsible.action";

export function useResponsibles() {
  const user = useUser();
  const companyId = user?.data?.company_id || "";

  return useQuery<Responsible[]>({
    queryKey: [QueryKeys.RESPONSIBLES],
    queryFn: () => getReponsible({ companyId: companyId }),
    enabled: !!companyId,
  });
}
