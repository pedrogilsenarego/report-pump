"use client";

import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useGroups, useSubgroups } from "@/hook/useGroups";
import InterventionAnswerFields from "@/modules/Intervention/components/InterventionAnswerFields";
import InterventionHeaderFields from "@/modules/Intervention/components/InterventionHeaderFields";
import { i18n } from "@/translations/i18n";

import { useNewIntervention } from "./useNewIntervention";

export default function NewIntervention() {
  const {
    checklistId,
    periodName,
    grouped,
    totalCount,
    answeredCount,
    isLoading,
    isEmpty,
    control,
    handleSubmit,
    onSubmit,
    isSubmitting,
    lock,
    setLock,
    slot1,
    slot2,
  } = useNewIntervention();

  const groups = useGroups(checklistId);
  const subgroups = useSubgroups(checklistId);

  const groupName = (code: number | string) =>
    groups.data?.find((item) => String(item.code) === String(code))?.name;

  const subgroupName = (codeGroup: number | string, code: number | string) =>
    subgroups.data?.find(
      (item) =>
        String(item.codeGroup) === String(codeGroup) &&
        String(item.code) === String(code)
    )?.name;

  if (isLoading) {
    return (
      <div className="p-6 opacity-60">{i18n.t("intervention.loading")}</div>
    );
  }

  if (isEmpty) {
    return <div className="p-6 opacity-60">{i18n.t("intervention.empty")}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {i18n.t("intervention.title")}
            {periodName ? ` — ${periodName}` : ""}
          </h2>
          <span className="text-sm opacity-60">
            {i18n.t("intervention.answeredCount", {
              answered: answeredCount,
              total: totalCount,
            })}
          </span>
        </div>

        <InterventionHeaderFields
          control={control}
          slot1={slot1}
          slot2={slot2}
        />

        <div className="flex flex-col gap-y-2">
          <InterventionAnswerFields
            grouped={grouped}
            control={control}
            groupName={groupName}
            subgroupName={subgroupName}
          />

          {/* "Add additional notes?" — one INT_NOTES row with no int_result_id. */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {i18n.t("intervention.addNotes")}
            </label>
            <Controller
              name="generalNote"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={i18n.t("intervention.generalNotePlaceholder")}
                />
              )}
            />
          </div>

          {/* "Save and lock Report?" — sets INTERVENTION.Locked, which gates printing. */}
          <label className="flex items-start gap-2 mt-2">
            <Checkbox
              checked={lock}
              onCheckedChange={(value) => setLock(value === true)}
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium">
                {i18n.t("intervention.saveAndLock")}
              </span>
              <span className="text-xs opacity-60">
                {i18n.t("intervention.lockHint")}
              </span>
            </span>
          </label>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {lock
              ? i18n.t("intervention.saveAndLock")
              : i18n.t("intervention.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
