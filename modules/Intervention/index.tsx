/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useRef } from "react";
import { useIntervention } from "./useIntervention";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { groupByGroupAndSubgroup } from "@/utils/checklist";
import { useGroups, useSubgroups } from "@/hook/useGroups";
import {
  InterventionBox,
  InterventionDescription,
  InterventionDetailsBox,
  InterventionGroup,
  InterventionGroupTitle,
  InterventionSubgroupTitle,
  InterventionPeriod,
} from "@/components/atoms/InterventionComponents";

export default function Intervention() {
  const { intervention } = useIntervention();
  // Group and sub-group names are per check-list, so both reads need its id.
  const checklistId = intervention?.data?.checklistId;
  const groups = useGroups(checklistId);
  const subgroups = useSubgroups(checklistId);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const grouped = groupByGroupAndSubgroup(intervention?.data?.results || []);

  const groupName = (code: number | string) =>
    groups.data?.find((item) => String(item.code) === String(code))?.name;

  const subgroupName = (codeGroup: number | string, code: number | string) =>
    subgroups.data?.find(
      (item) =>
        String(item.codeGroup) === String(codeGroup) &&
        String(item.code) === String(code)
    )?.name;

  return (
    <>
      <div
        ref={contentRef}
        style={{ rowGap: "10px" }}
        className="p-6 flex flex-col"
      >
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
                {subgroup.actions.map((action: any, index: number) => (
                  <InterventionBox key={index}>
                    <InterventionDetailsBox>
                      <InterventionGroup
                        codeGroup={action.codeGroup}
                        code={action.code}
                      />
                      <InterventionPeriod period={action.period} />
                      <InterventionDescription
                        description={action.description}
                      />
                    </InterventionDetailsBox>
                    <div className="border p-2">
                      <p>{action.value}</p>
                    </div>
                  </InterventionBox>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="p-6 flex">
        <Button onClick={() => reactToPrintFn()}>Print</Button>
      </div>
    </>
  );
}
