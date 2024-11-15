/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { useUser } from "@/hook/useUser";
import { useState } from "react";

import {
  NewInstallationSchema,
  NewInstallationType,
} from "./NewInstallation.validation";
import { addInstallation } from "@/actions/clientActions/installation.actions";
import { useInstallations } from "@/hook/useInstallation";

export default function useNewInstallation() {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useInstallations();
  const user = useUser();
  const form = useForm<NewInstallationType>({
    resolver: zodResolver(NewInstallationSchema),
    defaultValues: {
      name: undefined,
      condition: undefined,
      area: undefined,
      address: undefined,
      responsibleId: undefined,
    },
  });

  const { mutate: createNewInstallation, isPending } = useMutation({
    mutationFn: addInstallation,
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
        title: "Installation added with success",
        description: data,
      });
      setOpenModal(false);
      refetch();
      form.reset();
    },
  });

  function onSubmit(data: NewInstallationType) {
    console.log(data);
    const newData: NewInstallationType & { companyId?: string } = data;
    newData.companyId = user.data?.company_id;
    createNewInstallation(
      newData as NewInstallationType & { companyId: string }
    );
  }

  return { form, onSubmit, isPending, openModal, setOpenModal };
}
