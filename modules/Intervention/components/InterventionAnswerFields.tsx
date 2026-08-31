"use client";

import { Control, Controller } from "react-hook-form";

import {
  InterventionBox,
  InterventionDescription,
  InterventionDetailsBox,
  InterventionGroup,
  InterventionGroupTitle,
  InterventionPeriod,
  InterventionSubgroupTitle,
} from "@/components/atoms/InterventionComponents";
import { Input } from "@/components/ui/input";
import { ExclusiveMultiToggleForm } from "@/components/ui/multi-exclusive-toggle";
import { Textarea } from "@/components/ui/textarea";
import { i18n } from "@/translations/i18n";
import { ClAction } from "@/types/clAction.types";
import { LocalizedName } from "@/types/group.types";
import { ResultCodes } from "@/types/interventions.types";
import { GroupedActions } from "@/utils/checklist";
import { localizedName } from "@/utils/localizedName";

/**
 * Field names are keyed on the action's IDENTITY, never its position.
 *
 * The original version named toggles `action_${index}` with the index restarting at 0
 * inside every group, then read them back against the unfiltered, ungrouped array — so
 * answers landed on the wrong actions as soon as a check-list had more than one group.
 */
export const resultField = (action: ClAction) =>
  `r_${action.codeGroup}_${action.codeSubgroup}_${action.code}`;

export const noteField = (action: ClAction) =>
  `n_${action.codeGroup}_${action.codeSubgroup}_${action.code}`;

export const measurementField = (action: ClAction, slotCode: number) =>
  `m_${action.codeGroup}_${action.codeSubgroup}_${action.code}_${slotCode}`;

/** Spec domain (p3): V = Ok, X = Fail, - = See notes. */
export const resultOptions = () => [
  { value: ResultCodes.OK, label: i18n.t("intervention.result.ok") },
  { value: ResultCodes.FAIL, label: i18n.t("intervention.result.fail") },
  {
    value: ResultCodes.SEE_NOTES,
    label: i18n.t("intervention.result.seeNotes"),
  },
];

type Props = {
  grouped: GroupedActions<ClAction>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  groupName: (code: number | string) => LocalizedName | undefined;
  subgroupName: (
    codeGroup: number | string,
    code: number | string
  ) => LocalizedName | undefined;
};

/**
 * The group -> sub-group -> action answer tree.
 *
 * Shared by "Create New" and "Finalise existing" (sheet 5/6), which the spec draws as the
 * same screen with INPUT vs EDIT semantics — so they are one component here, differing
 * only in the values the form is seeded with.
 */
export default function InterventionAnswerFields({
  grouped,
  control,
  groupName,
  subgroupName,
}: Props) {
  const options = resultOptions();

  return (
    <>
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
                  <div key={action.id} className="flex flex-col gap-2">
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
                      <ExclusiveMultiToggleForm
                        name={resultField(action)}
                        control={control}
                        options={options}
                      />
                    </InterventionBox>

                    {/*
                      An action can carry n numeric readings, each with its own localized
                      label and unit ("RPM (Após 10 min):"). These are CL_ACTION_VALUES
                      slots and go to the MEASUREMENTS table.
                    */}
                    {action.values.length ? (
                      <div className="ml-8 flex flex-wrap gap-3">
                        {action.values.map((slot) => (
                          <label
                            key={slot.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="opacity-70">
                              {localizedName(slot.label)}
                            </span>
                            <Controller
                              name={measurementField(action, slot.code)}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.1"
                                  inputMode="decimal"
                                  className="w-28"
                                />
                              )}
                            />
                          </label>
                        ))}
                      </div>
                    ) : null}

                    <Controller
                      name={noteField(action)}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          rows={1}
                          className="ml-8 w-[calc(100%-2rem)]"
                          placeholder={i18n.t("intervention.notePlaceholder")}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
