/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { NewActionSchema, NewActionType } from "./NewAction.validation";
import { useRouter } from "next/navigation";
import { RouterKeys } from "@/constants/router";
import { useActions } from "@/hook/useActions";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { addAction } from "@/actions/clientActions/actions.actions";
import { Action } from "@/types/action.types";

export default function useNewAction() {
  const router = useRouter();
  const { toast } = useToast();
  const { refetch } = useActions();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewActionType>({
    resolver: zodResolver(NewActionSchema),
    defaultValues: {
      description: undefined,
      period: undefined,
    },
  });

  const { mutate: createNewAction, isPending } = useMutation({
    mutationFn: addAction,
    onError: (data: string) => {
      console.log(data);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: (data: string) => {
      toast({
        variant: "default",
        title: "Action added with success",
        description: data,
      });
      setOpenModal(false);
      refetch();
      form.reset();
    },
  });

  function onSubmit(data: NewActionType) {
    createNewAction(data as unknown as Partial<Action>);
  }

  return { form, onSubmit, openModal, setOpenModal };
}
