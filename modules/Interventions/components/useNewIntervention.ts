/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  NewInterventionSchema,
  NewInterventionType,
} from "./NewIntervention.validation";

export default function useNewIntervention() {
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewInterventionType>({
    resolver: zodResolver(NewInterventionSchema),
    defaultValues: {
      checklistId: undefined,
    },
  });

  function onSubmit(data: NewInterventionType) {
    console.log(data);
  }

  return { form, onSubmit, openModal, setOpenModal };
}
