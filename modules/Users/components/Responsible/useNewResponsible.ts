/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import {
  NewResponsibleSchema,
  NewResponsibleType,
} from "./NewResponsible.validation";

import { useUser } from "@/hook/useUser";
import { useEffect, useState } from "react";

import { addResponsible } from "@/actions/serverActions/responsible.actions";
import { useResponsibles } from "@/hook/useResponsibles";

export default function useNewTechnician() {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useResponsibles();
  const user = useUser();
  const form = useForm<NewResponsibleType>({
    resolver: zodResolver(NewResponsibleSchema),
    defaultValues: {
      name: undefined,
      email: undefined,
      phone: undefined,
      dateIn: new Date(),
      condition: undefined,
      dateOut: new Date(),
      password: undefined,
      confirmPassword: undefined,
      role: undefined,
    },
  });

  useEffect(() => {
    form.setValue("role", user.data?.role === 2 ? "6" : "7");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.data]);

  console.log(form.watch("dateIn"));

  const { mutate: createNewResponsible, isPending } = useMutation({
    mutationFn: addResponsible,
    onError: (data: any) => {
      console.log(data);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data?.error,
      });
    },
    onSuccess: (data: string) => {
      toast({
        variant: "default",
        title: "Technician added with success",
        description: data,
      });
      setOpenModal(false);
      refetch();
      form.reset();
    },
  });

  function onSubmit(data: NewResponsibleType) {
    const newData: NewResponsibleType & { companyId?: string } = data;
    newData.companyId = user.data?.company_id;
    createNewResponsible(newData as NewResponsibleType & { companyId: string });
  }

  return { form, onSubmit, isPending, openModal, setOpenModal };
}
