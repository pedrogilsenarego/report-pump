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
import {
  addInstallation,
  updateInstallation,
} from "@/actions/clientActions/installation.actions";
import { useInstallations } from "@/hook/useInstallation";
import { Installation } from "@/types/installation.types";
import { i18n } from "@/translations/i18n";

const toForm = (installation?: Installation): NewInstallationType => ({
  name: installation?.name ?? "",
  area: installation?.area ?? "",
  address: installation?.address ?? "",
  responsibleId: installation?.responsibleId
    ? String(installation.responsibleId)
    : "",
});

/** Create new (Action#16) when `installation` is omitted, Edit existing when given. */
export default function useNewInstallation(installation?: Installation) {
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { refetch } = useInstallations();
  const user = useUser();
  const form = useForm<NewInstallationType>({
    resolver: zodResolver(NewInstallationSchema),
    defaultValues: toForm(installation),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: NewInstallationType) =>
      installation
        ? updateInstallation({ id: installation.id, values })
        : addInstallation({
            ...values,
            companyId: user.data?.company_id as string,
          }),
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: i18n.t("installations.error"),
        description: data,
      });
    },
    onSuccess: () => {
      toast({
        variant: "default",
        title: i18n.t(
          installation ? "installations.updated" : "installations.created"
        ),
      });
      setOpenModal(false);
      refetch();
      if (!installation) form.reset(toForm());
    },
  });

  function onSubmit(data: NewInstallationType) {
    mutate(data);
  }

  /** Re-seed from the stored row each time the edit dialog opens. */
  function onOpenChange(value: boolean) {
    if (value && installation) form.reset(toForm(installation));
    setOpenModal(value);
  }

  return { form, onSubmit, isPending, openModal, onOpenChange };
}
