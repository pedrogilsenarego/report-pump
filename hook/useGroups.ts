"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

import {
  getGroups,
  getSubgroups,
} from "@/actions/clientActions/groups.actions";
import { Group, Subgroup } from "@/types/group.types";

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: [QueryKeys.GROUPS],
    queryFn: () => getGroups(),
  });
}

export function useSubgroups() {
  return useQuery<Subgroup[]>({
    queryKey: [QueryKeys.SUBGROUPS],
    queryFn: () => getSubgroups(),
  });
}
