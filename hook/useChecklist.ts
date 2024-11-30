"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getCheckLists } from "@/actions/clientActions/checklists.actions";
import { Checklist } from "@/types/checklist.types";

export function useChecklists() {
  return useQuery<Checklist[]>({
    queryKey: [QueryKeys.CHECKLISTS],
    queryFn: getCheckLists,
  });
}
