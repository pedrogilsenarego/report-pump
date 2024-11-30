"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { Intervention } from "@/types/interventions.types";
import { getInterventions } from "@/actions/clientActions/interventions.actions";

export function useInterventions() {
  return useQuery<Intervention[]>({
    queryKey: [QueryKeys.INTERVENTIONS],
    queryFn: getInterventions,
  });
}
