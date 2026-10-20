"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { NewPumpSchema, NewPumpType } from "./NewPump.validation";
import { addPump, updatePump } from "@/actions/clientActions/pumps.actions";
import { mapPumpToForm } from "@/mappers/pump.mapper";
import { usePumps } from "@/hook/usePumps";
import { Pump } from "@/types/pump.types";
import { i18n } from "@/translations/i18n";

const EMPTY: Partial<NewPumpType> = {
  installationId: "",
  type: undefined,
  subType: undefined,
  pumpTag: "",
  pumpBrand: "",
  pumpModel: "",
  pumpSn: "",
  motorTag: "",
  motorBrand: "",
  motorModel: "",
  motorSn: "",
  ctrlTag: "",
  ctrlBrand: "",
  ctrlModel: "",
  ctrlType: "",
  couplingBrand: "",
  couplingModel: "",
  couplingSn: "",
  gearbBrand: "",
  gearbModel: "",
  gearbSn: "",
  columnLength: "",
  nrStages: "",
};

/** Screen#13 (create) when `pump` is omitted, Screen#14 (edit) when it is given. */
export default function useNewPump(pump?: Pump) {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = usePumps();

  const defaultValues = pump ? mapPumpToForm(pump) : EMPTY;

  const form = useForm<NewPumpType>({
    resolver: zodResolver(NewPumpSchema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: NewPumpType) =>
      pump ? updatePump({ id: pump.id, values }) : addPump(values),
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: i18n.t("pumpGroup.error"),
        description: data,
      });
    },
    onSuccess: () => {
      toast({
        variant: "default",
        title: i18n.t(pump ? "pumpGroup.updated" : "pumpGroup.created"),
      });
      setOpenModal(false);
      refetch();
      if (!pump) form.reset(EMPTY);
    },
  });

  function onSubmit(data: NewPumpType) {
    mutate(data);
  }

  /** Re-seed from the stored row each time the edit dialog opens, dropping stale edits. */
  function onOpenChange(value: boolean) {
    if (value && pump) form.reset(mapPumpToForm(pump));
    setOpenModal(value);
  }

  return { form, onSubmit, isPending, openModal, onOpenChange };
}
