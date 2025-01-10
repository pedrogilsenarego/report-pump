/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  NewTechnicianSchema,
  NewTechnicianType,
} from "./NewTechnician.validation";
//import { addTechnician } from "@/actions/clientActions/technician.actions";
import { useUser } from "@/hook/useUser";
import { useEffect, useState } from "react";
import { useTechnicians } from "@/hook/useTechnician";
import { addTechnician } from "@/actions/serverActions/technician.actions";

export default function useNewTechnician() {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useTechnicians();
  const user = useUser();
  const form = useForm<NewTechnicianType>({
    resolver: zodResolver(NewTechnicianSchema),
    defaultValues: {
      name: undefined,
      email: undefined,
      phone: undefined,
      certification: undefined,
      condition: undefined,
      function: undefined,
      password: undefined,
      confirmPassword: undefined,
      role: undefined,
    },
  });

  useEffect(() => {
    form.setValue("role", user.data?.role === 2 ? "4" : "5");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.data]);

  const { mutate: createNewTechnician, isPending } = useMutation({
    mutationFn: addTechnician,
    onError: (error: any) => {
      console.error("Mutation error:", error);

      const errorMessage =
        error?.message ||
        (typeof error === "string" ? error : "An unexpected error occurred");

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
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
    const newData: NewTechnicianType & { companyId?: string } = data;
    newData.companyId = user.data?.company_id;
    createNewTechnician(newData as NewTechnicianType & { companyId: string });
  }

  return { form, onSubmit, isPending, openModal, setOpenModal };
}
