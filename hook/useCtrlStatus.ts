"use client";

import { useQuery } from "@tanstack/react-query";

import {
  CtrlStatus,
  getCtrlStatus,
} from "@/actions/clientActions/ctrlStatus.actions";
import { QueryKeys } from "@/constants/queryKeys";

// Reference data — safe to cache for the session.
export function useCtrlStatus() {
  return useQuery<CtrlStatus[]>({
    queryKey: [QueryKeys.CTRL_STATUS],
    queryFn: getCtrlStatus,
    staleTime: Infinity,
  });
}
