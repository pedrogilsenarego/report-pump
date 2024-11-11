"use client";

import { getTechnician } from "@/actions/clientActions/technician.actions";
import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Technician } from "@/types/technician.types";

export function useTechnicians() {
  const user = useUser();
  const companyId = user?.data?.company_id || "";

  return useQuery<Technician[]>({
    queryKey: [QueryKeys.TECHNICIANS],
    queryFn: () => getTechnician({ companyId: companyId }),
    enabled: !!companyId,
  });
}
