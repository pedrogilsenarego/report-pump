/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  Intervention,
  InterventionDetail,
} from "@/types/interventions.types";
import {
  getIntervention,
  getInterventions,
} from "@/actions/clientActions/interventions.actions";
import { getChecklistActions } from "@/actions/clientActions/clActions.actions";
import { ClAction } from "@/types/clAction.types";

export function useInterventions() {
  return useQuery<Intervention[]>({
    queryKey: [QueryKeys.INTERVENTIONS],
    queryFn: getInterventions,
  });
}

export function useInterventionResult(interventionId: number | undefined) {
  return useQuery<InterventionDetail>({
    queryKey: [QueryKeys.INTERVENTION, interventionId],
    queryFn: () => getIntervention({ interventionId }),
    enabled: !!interventionId,
  });
}

/**
 * The check-list template's actions, with their per-language text and measurement slots.
 * Scoped to one check-list, like useGroups / useSubgroups.
 */
export function useChecklistActions(checklistId: number | undefined) {
  return useQuery<ClAction[]>({
    queryKey: [QueryKeys.CHECKLIST_ACTIONS, checklistId],
    queryFn: () => getChecklistActions(checklistId),
    enabled: !!checklistId,
  });
}
