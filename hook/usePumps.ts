"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Pump } from "@/types/pump.types";
import { getPumps } from "@/actions/clientActions/pumps.actions";

export function usePumps() {
  const user = useUser();
  const companyId = user?.data?.company_id || "";

  return useQuery<Pump[]>({
    queryKey: [QueryKeys.PUMPS, companyId],
    queryFn: () => getPumps({ companyId: companyId }),
    enabled: !!companyId,
  });
}
