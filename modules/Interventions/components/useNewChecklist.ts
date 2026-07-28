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

const DEFAULT_NAME = "NFPA-25 Last Edition";

const currentDate = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${now.getFullYear()}.${month}.${day}`;
};

export default function useNewChecklist() {
  const { toast } = useToast();
  const checklists = useChecklists();
  const [openModal, setOpenModal] = useState(false);

  // Report Nr. is the next code available (table code + 1)
  const nextCode =
    (checklists.data?.reduce(
      (max, checklist) => Math.max(max, checklist.code || 0),
      0
    ) || 0) + 1;

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
      date: currentDate(),
      name: DEFAULT_NAME,
      nfpaEd: "",
      companyResp: "",
      nameResp: "",
      phone: "",
      email: "",
    },
  });

  function onSubmit(data: NewChecklistType) {
    addChecklistMutation(data);
  }

  return {
    form,
    onSubmit,
    openModal,
    setOpenModal,
    isPending,
    nextCode,
  };
}
