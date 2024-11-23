/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hook/useUser";
import { useState } from "react";
import { useInstallations } from "@/hook/useInstallation";
import { NewPumpSchema, NewPumpType } from "./NewPump.validation";
import { addPump } from "@/actions/clientActions/pumps.actions";

export default function useNewPump() {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useInstallations();
  const user = useUser();
  const form = useForm<NewPumpType>({
    resolver: zodResolver(NewPumpSchema),
    defaultValues: {
      type: undefined,
      condition: undefined,
      installationId: undefined,
    },
  });

  const { mutate: createNewPump, isPending } = useMutation({
    mutationFn: addPump,
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
        title: "Pump added with success",
        description: data,
      });
      setOpenModal(false);
      refetch();
      form.reset();
    },
  });

  function onSubmit(data: NewPumpType) {
    console.log(data);
    createNewPump(data);
  }

  return { form, onSubmit, isPending, openModal, setOpenModal };
}
