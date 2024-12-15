/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { Intervention } from "@/types/interventions.types";
import {
  getIntervention,
  getInterventions,
} from "@/actions/clientActions/interventions.actions";

export function useInterventions() {
  return useQuery<Intervention[]>({
    queryKey: [QueryKeys.INTERVENTIONS],
    queryFn: getInterventions,
  });
}

export function useInterventionResult(interventionId: number | undefined) {
  return useQuery<any>({
    queryKey: [QueryKeys.INTERVENTION],
    queryFn: () => getIntervention({ interventionId }),
    enabled: !!interventionId,
  });
}
