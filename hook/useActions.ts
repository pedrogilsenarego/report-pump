"use client";

import { QueryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

import { getActions } from "@/actions/clientActions/actions.actions";
import { Action } from "@/types/action.types";

export function useActions() {
  return useQuery<Action[]>({
    queryKey: [QueryKeys.ACTIONS],
    queryFn: () => getActions(),
  });
}
