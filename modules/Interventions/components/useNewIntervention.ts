"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  NewInterventionSchema,
  NewInterventionType,
} from "./NewIntervention.validation";
import { RouterKeys } from "@/constants/router";
import { useChecklists } from "@/hook/useChecklist";
import { usePumps } from "@/hook/usePumps";

export default function useNewIntervention() {
  const { data: checklists, isLoading: isLoadingChecklists } = useChecklists();
  const { data: pumps, isLoading: isLoadingPumps } = usePumps();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm<NewInterventionType>({
    resolver: zodResolver(NewInterventionSchema),
    defaultValues: {
      checklistId: undefined,
      installationId: undefined,
      pumpId: undefined,
      period: undefined,
    },
  });

  // Sheet 5/6 selects the pump group INSIDE an installation, so the list narrows once an
  // installation is chosen rather than offering every pump the customer owns.
  const installationId = form.watch("installationId");
  const pumpsForInstallation = (pumps || []).filter(
    (pump) => !installationId || String(pump.installationId) === installationId
  );

  function onSubmit(data: NewInterventionType) {
    router.push(
      RouterKeys.NEW_INTERVENTION.replace(":id", data.checklistId)
        .replace(":installation", data.installationId)
        .replace(":pump", data.pumpId)
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
    pumps: pumpsForInstallation,
    isLoadingPumps,
  };
}
