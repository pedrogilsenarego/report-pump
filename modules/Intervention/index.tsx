"use client";

import { useRef } from "react";
import { Controller } from "react-hook-form";
import { useReactToPrint } from "react-to-print";

import {
  InterventionBox,
  InterventionDescription,
  InterventionDetailsBox,
  InterventionGroup,
  InterventionGroupTitle,
  InterventionPeriod,
  InterventionSubgroupTitle,
} from "@/components/atoms/InterventionComponents";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useGroups, useSubgroups } from "@/hook/useGroups";
import { i18n } from "@/translations/i18n";
import { InterventionResult, ResultCodes } from "@/types/interventions.types";
import { groupByGroupAndSubgroup } from "@/utils/checklist";
import { localizedName } from "@/utils/localizedName";

import InterventionAnswerFields from "./components/InterventionAnswerFields";
import InterventionHeaderFields from "./components/InterventionHeaderFields";
import { useIntervention } from "./useIntervention";

const resultLabel = (result: InterventionResult["result"]) => {
  switch (result) {
    case ResultCodes.OK:
      return i18n.t("intervention.result.ok");
    case ResultCodes.FAIL:
      return i18n.t("intervention.result.fail");
    case ResultCodes.SEE_NOTES:
      return i18n.t("intervention.result.seeNotes");
    default:
      // The undocumented '*' from sheet 5/6 — shown verbatim rather than hidden.
      return result;
  }
};

export default function Intervention() {
  const {
    detail,
    isLoading,
    locked,
    editing,
    setEditing,
    canEdit,
    editableGrouped,
    control,
    handleSubmit,
    onSubmit,
    isSaving,
    lock,
    setLock,
    slot1,
    slot2,
    lockNow,
    isLocking,
  } = useIntervention();

  // Group and sub-group names are per check-list, so both reads need its id.
  const checklistId = detail?.intervention.checklistId;
  const groups = useGroups(checklistId);
  const subgroups = useSubgroups(checklistId);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const grouped = groupByGroupAndSubgroup(detail?.results || []);

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

  // ---- Finalise existing: EDIT (on Screen) all fields, then Save and lock. ----
  if (editing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {i18n.t("intervention.finaliseTitle")}
          </h2>

          <InterventionHeaderFields
            control={control}
            slot1={slot1}
            slot2={slot2}
          />

          <div className="flex flex-col gap-y-2">
            <InterventionAnswerFields
              grouped={editableGrouped}
              control={control}
              groupName={groupName}
              subgroupName={subgroupName}
            />

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

            <div className="flex gap-2">
              <Button type="submit" isLoading={isSaving}>
                {lock
                  ? i18n.t("intervention.saveAndLock")
                  : i18n.t("intervention.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                {i18n.t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // ---- View existing: BROWSE (on Screen) all fields, read-only. ----
  return (
    <>
      <div ref={contentRef} className="p-6 flex flex-col gap-y-2">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-sm border ${
              locked ? "opacity-100" : "opacity-60"
            }`}
          >
            {locked
              ? i18n.t("intervention.locked")
              : i18n.t("intervention.notLocked")}
          </span>
          {detail?.intervention.refMonth ? (
            <span className="text-xs opacity-70">
              {i18n.t("intervention.refMonth")}:{" "}
              {detail.intervention.refMonth}
            </span>
          ) : null}
          {detail?.intervention.verifyedBy ? (
            <span className="text-xs opacity-70">
              {i18n.t("intervention.verifyedBy")}:{" "}
              {detail.intervention.verifyedBy}
            </span>
          ) : null}
          {detail?.intervention.responsable ? (
            <span className="text-xs opacity-70">
              {i18n.t("intervention.responsable")}:{" "}
              {detail.intervention.responsable}
            </span>
          ) : null}
          {detail?.technicians.map((technician) => (
            <span key={technician.slot} className="text-xs opacity-70">
              {i18n.t(`intervention.technician${technician.slot}`)}:{" "}
              {technician.name}
            </span>
          ))}
        </div>

        {grouped.map((group) => (
          <div key={group.codeGroup} className="mb-6">
            <InterventionGroupTitle
              group={String(group.codeGroup)}
              name={groupName(group.codeGroup)}
            />
            {group.subgroups.map((subgroup) => (
              <div key={`${group.codeGroup}.${subgroup.codeSubgroup}`}>
                <InterventionSubgroupTitle
                  group={group.codeGroup}
                  subgroup={subgroup.codeSubgroup}
                  name={subgroupName(group.codeGroup, subgroup.codeSubgroup)}
                />
                <div className="flex flex-col gap-2">
                  {subgroup.actions.map((action) => (
                    <div key={action.id} className="flex flex-col gap-1">
                      <InterventionBox>
                        <InterventionDetailsBox>
                          <InterventionGroup
                            codeGroup={action.codeGroup}
                            code={action.code}
                          />
                          <InterventionPeriod period={action.period} />
                          <InterventionDescription
                            description={action.name}
                            source={action.source}
                          />
                        </InterventionDetailsBox>
                        <div className="border px-3 py-1 rounded-sm whitespace-nowrap">
                          <p>{resultLabel(action.result)}</p>
                        </div>
                      </InterventionBox>

                      {/*
                        A template re-import can drop an action; the recorded answer
                        survives with its codes but loses its name. Say so rather than
                        rendering a blank row.
                      */}
                      {action.orphaned ? (
                        <p className="ml-8 text-xs opacity-60">
                          {i18n.t("intervention.orphaned")}
                        </p>
                      ) : null}

                      {action.measurements.length ? (
                        <div className="ml-8 flex flex-wrap gap-4 text-sm">
                          {action.measurements.map((measurement) => (
                            <span key={measurement.codeValues}>
                              <span className="opacity-70">
                                {localizedName(measurement.label) ||
                                  `#${measurement.codeValues}`}
                              </span>{" "}
                              <span className="tabular-nums">
                                {measurement.value ?? "—"}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {action.notes.map((note, index) => (
                        <p key={index} className="ml-8 text-sm opacity-80">
                          {note}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {detail?.generalNotes.length ? (
          <div className="mt-4">
            <h3 className="text-base font-medium mb-1">
              {i18n.t("intervention.generalNotes")}
            </h3>
            {detail.generalNotes.map((note, index) => (
              <p key={index} className="text-sm opacity-80">
                {note}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-6 flex flex-col gap-2 items-start">
        {/*
          Sheet 5/6: printing is gated on Locked — "IF INTERVENTION.Locked = 2 -> SAVE
          report; ELSE PRINT: 'Report not Locked; cannot be printed'".
        */}
        <div className="flex gap-2">
          <Button onClick={() => reactToPrintFn()} disabled={!locked}>
            {i18n.t("intervention.print")}
          </Button>
          {canEdit ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              {i18n.t("intervention.finalise")}
            </Button>
          ) : null}
          {!locked ? (
            <Button variant="outline" onClick={lockNow} isLoading={isLocking}>
              {i18n.t("intervention.lock")}
            </Button>
          ) : null}
        </div>
        {!locked ? (
          <p className="text-sm opacity-60">
            {i18n.t("intervention.printBlocked")}
          </p>
        ) : null}
      </div>
    </>
  );
}
