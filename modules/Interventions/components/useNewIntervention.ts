/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  NewInterventionSchema,
  NewInterventionType,
} from "./NewIntervention.validation";
import { useRouter } from "next/navigation";
import { RouterKeys } from "@/constants/router";

export default function useNewIntervention() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewInterventionType>({
    resolver: zodResolver(NewInterventionSchema),
    defaultValues: {
      checklistId: undefined,
    },
  });

  function onSubmit(data: NewInterventionType) {
    router.push(RouterKeys.NEW_INTERVENTION.replace(":id", data.checklistId));
  }

  return { form, onSubmit, openModal, setOpenModal };
}
