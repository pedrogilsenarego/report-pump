"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  getCheckListSummaries,
  getCheckLists,
} from "@/actions/clientActions/checklists.actions";
import { Checklist, ChecklistSummary } from "@/types/checklist.types";

/**
 * There is no `useChecklist(id)` any more. It read `checklists -> checklistactions ->
 * actions`, the pre-import catalog, which is empty for every check-list Action#04
 * imported. Use `useChecklistActions(id)` from hook/useInterventions.ts, which reads
 * cl_action.
 */

export function useChecklists() {
  return useQuery<Checklist[]>({
    queryKey: [QueryKeys.CHECKLISTS],
    queryFn: getCheckLists,
  });
}

// The list screen: every check-list plus how big a tree Action#04 imported under it.
export function useChecklistSummaries() {
  return useQuery<ChecklistSummary[]>({
    queryKey: [QueryKeys.CHECKLISTS_SUMMARY],
    queryFn: getCheckListSummaries,
  });
}
