"use client";

import { useChecklist } from "@/hook/useChecklist";
import { useParams } from "next/navigation";

export const useNewIntervention = () => {
  const params = useParams();
  const { checklist } = params;

  const checklistId = checklist ? parseInt(checklist as string) : undefined;

  const { data: checklistData, isLoading: isLoadingChecklist } =
    useChecklist(checklistId);

  return { checklistData, isLoadingChecklist };
};
