"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

import {
  getGroups,
  getSubgroups,
} from "@/actions/clientActions/groups.actions";
import { Group, Subgroup } from "@/types/group.types";

// Groups belong to a check-list, so the id is part of the query key — two check-lists
// both have a group 1 and they are different rows.
export function useGroups(checklistId?: number) {
  return useQuery<Group[]>({
    queryKey: [QueryKeys.GROUPS, checklistId],
    queryFn: () => getGroups(checklistId!),
    enabled: !!checklistId,
  });
}

export function useSubgroups(checklistId?: number) {
  return useQuery<Subgroup[]>({
    queryKey: [QueryKeys.SUBGROUPS, checklistId],
    queryFn: () => getSubgroups(checklistId!),
    enabled: !!checklistId,
  });
}
