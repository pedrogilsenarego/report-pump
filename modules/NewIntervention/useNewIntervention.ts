/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { addIntervention } from "@/actions/clientActions/interventions.actions";
import { RouterKeys } from "@/constants/router";
import { useChecklist, useChecklists } from "@/hook/useChecklist";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export const useNewIntervention = () => {
  const params = useParams();
  const { checklist, installation } = params;
  const { control, handleSubmit } = useForm();
  const checklists = useChecklists();
  const router = useRouter();
  const { toast } = useToast();
  const checklistId = checklist ? parseInt(checklist as string) : undefined;
  const installationId = installation as string;

  const { mutate: newInterventionMutation, isPending: isSubmitting } =
    useMutation({
      mutationFn: addIntervention,
      onError: (data: string) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: data,
        });
      },
      onSuccess: () => {
        checklists.refetch();

        router.push(RouterKeys.INTERVENTIONS);
      },
    });

  const onSubmit = (data: any) => {
    newInterventionMutation({ installationId, checklistId });
  };

  const { data: checklistData, isLoading: isLoadingChecklist } =
    useChecklist(checklistId);

  return {
    checklistData,
    isLoadingChecklist,
    control,
    handleSubmit,
    onSubmit,
    isSubmitting,
  };
};
