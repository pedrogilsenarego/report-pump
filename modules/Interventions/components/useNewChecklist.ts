/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { NewChecklistType, NewCheklistSchema } from "./NewChecklist.validation";
import { useMutation } from "@tanstack/react-query";
import { addChecklist } from "@/actions/clientActions/checklists.actions";
import { useToast } from "@/hooks/use-toast";
import { useChecklists } from "@/hook/useChecklist";

export default function useNewChecklist() {
  const { toast } = useToast();
  const checklists = useChecklists();
  const [openModal, setOpenModal] = useState(false);

  const { mutate: addChecklistMutation, isPending } = useMutation({
    mutationFn: addChecklist,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: () => {
      checklists.refetch();
      setOpenModal(false);
      form.reset();
    },
  });
  const form = useForm<NewChecklistType>({
    resolver: zodResolver(NewCheklistSchema),
    defaultValues: {
      nfpaEd: undefined,
    },
  });

  function onSubmit(data: NewChecklistType) {
    addChecklistMutation(data);
  }

  return { form, onSubmit, openModal, setOpenModal, isPending };
}
