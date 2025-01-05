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
import { useChecklists } from "@/hook/useChecklist";

export default function useNewIntervention() {
  const { data: checklists, isLoading: isLoadingChecklists } = useChecklists();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewInterventionType>({
    resolver: zodResolver(NewInterventionSchema),
    defaultValues: {
      checklistId: undefined,
      installationId: undefined,
      period: undefined,
    },
  });

  function onSubmit(data: NewInterventionType) {
    router.push(
      RouterKeys.NEW_INTERVENTION.replace(":id", data.checklistId)
        .replace(":installation", data.installationId)
        .replace(":period", data.period)
    );
  }

  return {
    form,
    onSubmit,
    openModal,
    setOpenModal,
    checklists,
    isLoadingChecklists,
  };
}
