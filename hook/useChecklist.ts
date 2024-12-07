"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  getCheckList,
  getCheckLists,
} from "@/actions/clientActions/checklists.actions";
import { Checklist } from "@/types/checklist.types";

export function useChecklists() {
  return useQuery<Checklist[]>({
    queryKey: [QueryKeys.CHECKLISTS],
    queryFn: getCheckLists,
  });
}

export function useChecklist(checklistId: number | undefined) {
  return useQuery<Checklist[]>({
    queryKey: [QueryKeys.CHECKLIST, checklistId],
    queryFn: () => getCheckList(checklistId),
    enabled: !!checklistId,
  });
}
