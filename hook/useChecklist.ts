"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  getCheckList,
  getCheckListSummaries,
  getCheckLists,
} from "@/actions/clientActions/checklists.actions";
import { Checklist, ChecklistSummary } from "@/types/checklist.types";

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

// The list screen: every check-list plus how big a tree Action#04 imported under it.
export function useChecklistSummaries() {
  return useQuery<ChecklistSummary[]>({
    queryKey: [QueryKeys.CHECKLISTS_SUMMARY],
    queryFn: getCheckListSummaries,
  });
}
