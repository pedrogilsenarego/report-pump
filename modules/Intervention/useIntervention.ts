/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  lockIntervention,
  updateIntervention,
} from "@/actions/clientActions/interventions.actions";
import { QueryKeys } from "@/constants/queryKeys";
import {
  useChecklistActions,
  useInterventionResult,
} from "@/hook/useInterventions";
import { useToast } from "@/hooks/use-toast";
import { i18n } from "@/translations/i18n";
import { AnswerDraft, ResultCode } from "@/types/interventions.types";
import { groupByGroupAndSubgroup } from "@/utils/checklist";
import {
  measurementField,
  noteField,
  resultField,
} from "./components/InterventionAnswerFields";

/**
 * Screen#09 REPORTS draws "View existing" (BROWSE) and "Finalise existing" (EDIT) as the
 * same screen with different semantics. This hook serves both: a locked report is
 * read-only, an unlocked one is editable, which is exactly the distinction the spec's
 * Locked flag already carries.
 */
export const useIntervention = () => {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const interventionId = params.interventionId
    ? parseInt(params.interventionId as string, 10)
    : undefined;

  const query = useInterventionResult(interventionId);
  const detail = query.data;
  const locked = detail?.intervention.locked ?? false;

  const [editing, setEditing] = useState(false);
  const [lock, setLock] = useState(false);

  const actionsQuery = useChecklistActions(detail?.intervention.checklistId);
  const { control, handleSubmit, reset, watch } = useForm();

  /**
   * The editable list is the actions this report already answered, not the whole template.
   * Re-deriving it from period + pump type could silently drop an answer that was recorded
   * under a different filter, and an orphaned answer (its template row dropped by a
   * re-import) has no ClAction to render at all.
   */
  const editableActions = useMemo(() => {
    const answered = new Set(
      (detail?.results || []).map(
        (row) => `${row.codeGroup}.${row.codeSubgroup}.${row.code}`
      )
    );
    return (actionsQuery.data || []).filter((action) =>
      answered.has(`${action.codeGroup}.${action.codeSubgroup}.${action.code}`)
    );
  }, [actionsQuery.data, detail?.results]);

  const editableGrouped = useMemo(
    () => groupByGroupAndSubgroup(editableActions),
    [editableActions]
  );

  // Seed the form from what was recorded, once both reads have landed.
  useEffect(() => {
    if (!detail || !editableActions.length) return;

    const values: Record<string, unknown> = {
      controlerStatus: detail.intervention.controlerStatus ?? "",
      refMonth: detail.intervention.refMonth ?? "",
      verifyedBy: detail.intervention.verifyedBy ?? "",
      responsable: detail.intervention.responsable ?? "",
      technician1:
        detail.technicians.find((row) => row.slot === 1)?.profileId ?? "",
      technician2:
        detail.technicians.find((row) => row.slot === 2)?.profileId ?? "",
      generalNote: detail.generalNotes.join("\n"),
    };

    editableActions.forEach((action) => {
      const recorded = detail.results.find(
        (row) =>
          row.codeGroup === action.codeGroup &&
          row.codeSubgroup === action.codeSubgroup &&
          row.code === action.code
      );
      values[resultField(action)] = recorded?.result ?? "";
      // Per-action notes only; the free-standing ones are the general note above.
      values[noteField(action)] = (recorded?.notes || []).join("\n");
      action.values.forEach((slot) => {
        const measurement = recorded?.measurements.find(
          (row) => row.codeValues === slot.code
        );
        values[measurementField(action, slot.code)] =
          measurement?.value != null ? String(measurement.value) : "";
      });
    });

    reset(values);
  }, [detail, editableActions, reset]);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.INTERVENTION, interventionId],
    });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.INTERVENTIONS] });
  };

  const onError = (error: any) =>
    toast({
      variant: "destructive",
      title: i18n.t("intervention.error"),
      description: typeof error === "string" ? error : error?.message,
    });

  const { mutate: lockNow, isPending: isLocking } = useMutation({
    mutationFn: () => lockIntervention(interventionId!),
    onError,
    onSuccess: (result) => {
      if (result?.warning) {
        toast({
          title: i18n.t("intervention.savedLocked"),
          description: result.warning,
        });
      }
      invalidate();
    },
  });

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: updateIntervention,
    onError,
    onSuccess: (result) => {
      toast({
        title: lock
          ? i18n.t("intervention.savedLocked")
          : i18n.t("intervention.saved"),
        description: result?.warning || undefined,
      });
      setEditing(false);
      setLock(false);
      invalidate();
    },
  });

  const onSubmit = (formValues: any) => {
    if (!interventionId) return;

    const answers: AnswerDraft[] = editableActions.map((action) => ({
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

    save({
      interventionId,
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

  const values = watch();

  return {
    interventionId,
    detail,
    isLoading: query.isLoading,
    locked,
    // Finalise existing is only offered while the report is still unlocked.
    editing: editing && !locked,
    setEditing,
    canEdit: !locked && editableActions.length > 0,
    editableGrouped,
    control,
    handleSubmit,
    onSubmit,
    isSaving,
    lock,
    setLock,
    slot1: values?.technician1,
    slot2: values?.technician2,
    lockNow: () => lockNow(),
    isLocking,
  };
};
