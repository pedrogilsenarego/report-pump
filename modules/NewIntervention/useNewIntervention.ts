/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addIntervention } from "@/actions/clientActions/interventions.actions";
import { periodLabel } from "@/constants/actions";
import { QueryKeys } from "@/constants/queryKeys";
import { RouterKeys } from "@/constants/router";
import { useChecklistActions } from "@/hook/useInterventions";
import { usePumps } from "@/hook/usePumps";
import { useToast } from "@/hooks/use-toast";
import { i18n } from "@/translations/i18n";
import { AnswerDraft, ResultCode } from "@/types/interventions.types";
import { appliesToPumpType, groupByGroupAndSubgroup, isDueForPeriod } from "@/utils/checklist";
import {
  measurementField,
  noteField,
  resultField,
} from "@/modules/Intervention/components/InterventionAnswerFields";

export const useNewIntervention = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checklistId = params.checklist
    ? parseInt(params.checklist as string, 10)
    : undefined;
  const installationId = params.installation as string;
  const pumpId = params.pump as string;
  const period = params.period
    ? parseInt(params.period as string, 10)
    : undefined;

  const [lock, setLock] = useState(false);

  const { control, handleSubmit, watch } = useForm();
  const actionsQuery = useChecklistActions(checklistId);
  const pumps = usePumps();

  const pumpType = pumps.data?.find(
    (pump) => String(pump.id) === pumpId
  )?.type;

  /**
   * Two filters, both from the spec:
   *  - PERIODICITY: a round of period n includes everything more frequent (isDueForPeriod).
   *  - CL_ACTION.Pump_Type against the selected group's PUMP_GROUP.Type. Sheet 5/6 defines
   *    `xType = PUMP_GROUP:Type` right before generating the blank report, which is the
   *    report that loops CL_ACTION.
   */
  const dueActions = useMemo(
    () =>
      (actionsQuery.data || []).filter(
        (action) =>
          isDueForPeriod(action.period, period) &&
          appliesToPumpType(action.pumpType, pumpType)
      ),
    [actionsQuery.data, period, pumpType]
  );

  const grouped = useMemo(
    () => groupByGroupAndSubgroup(dueActions),
    [dueActions]
  );

  const values = watch();
  const answeredCount = dueActions.filter(
    (action) => !!values?.[resultField(action)]
  ).length;

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: addIntervention,
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: i18n.t("intervention.error"),
        description: typeof error === "string" ? error : error?.message,
      });
    },
    onSuccess: (result) => {
      toast({
        title: lock
          ? i18n.t("intervention.savedLocked")
          : i18n.t("intervention.saved"),
        // The report is saved either way; a mail failure is reported, not hidden.
        description: result?.warning || undefined,
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INTERVENTIONS] });
      router.push(RouterKeys.INTERVENTIONS);
    },
  });

  const onSubmit = (formValues: any) => {
    if (!checklistId) return;

    const answers: AnswerDraft[] = dueActions.map((action) => ({
      action,
      result: formValues[resultField(action)] as ResultCode | undefined,
      note: formValues[noteField(action)],
      measurements: Object.fromEntries(
        action.values.map((slot) => [
          slot.code,
          formValues[measurementField(action, slot.code)] ?? "",
        ])
      ),
    }));

    if (!answers.some((answer) => answer.result)) {
      toast({
        variant: "destructive",
        title: i18n.t("intervention.noneAnswered"),
      });
      return;
    }

    mutate({
      checklistId,
      installationId,
      pumpId,
      period,
      answers,
      generalNote: formValues.generalNote,
      controlerStatus: formValues.controlerStatus,
      refMonth: formValues.refMonth,
      verifyedBy: formValues.verifyedBy,
      responsable: formValues.responsable,
      technician1: formValues.technician1,
      technician2: formValues.technician2,
      lock,
    });
  };

  return {
    checklistId,
    period,
    periodName: periodLabel(period),
    grouped,
    totalCount: dueActions.length,
    answeredCount,
    isLoading: actionsQuery.isLoading,
    isEmpty: !actionsQuery.isLoading && dueActions.length === 0,
    control,
    handleSubmit,
    onSubmit,
    isSubmitting,
    lock,
    setLock,
    slot1: values?.technician1,
    slot2: values?.technician2,
  };
};
