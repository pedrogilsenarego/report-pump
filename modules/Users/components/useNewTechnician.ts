/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  NewTechnicianSchema,
  NewTechnicianType,
} from "./NewTechnician.validation";
import { addTechnician } from "@/actions/clientActions/technician.actions";
import { useUser } from "@/hook/useUser";
import { useState } from "react";
import { useTechnicians } from "@/hook/useTechnician";

export default function useNewTechnician() {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useTechnicians();
  const user = useUser();
  const form = useForm<NewTechnicianType>({
    resolver: zodResolver(NewTechnicianSchema),
    defaultValues: {
      email: undefined,
      phone: undefined,
      certification: undefined,
      condition: undefined,
      function: undefined,
    },
  });

  const { mutate: createNewTechnician, isPending } = useMutation({
    mutationFn: addTechnician,
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
        title: "Technician added with success",
        description: data,
      });
      setOpenModal(false);
      refetch();
      form.reset();
    },
  });

  function onSubmit(data: NewTechnicianType) {
    const newData: NewTechnicianType & { technicianProfile?: string } = data;
    newData.technicianProfile = user.data?.id;
    createNewTechnician(
      newData as NewTechnicianType & { technicianProfile: string }
    );
  }

  return { form, onSubmit, isPending, openModal, setOpenModal };
}
