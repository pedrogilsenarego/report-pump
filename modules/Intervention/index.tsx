/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useRef } from "react";
import { useIntervention } from "./useIntervention";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { groupByCodeGroup } from "@/utils/checklist";
import { i18n } from "@/translations/i18n";
import {
  InterventionDescription,
  InterventionDetailsBox,
  InterventionGroup,
  InterventionPeriod,
} from "@/components/atoms/InterventionComponents";

export default function Intervention() {
  const { intervention } = useIntervention();

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const groupedInterventions = groupByCodeGroup(intervention?.data || []);

  return (
    <>
      <div
        ref={contentRef}
        style={{ rowGap: "10px" }}
        className="p-6 flex flex-col"
      >
        {Object.entries(groupedInterventions).map(([group, interventions]) => (
          <div key={group} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {group} - {i18n.t(`checklists.groupTitle.${group}`)}
            </h2>
            {interventions.map((intervention: any, index: number) => (
              <div
                key={index}
                className="border flex p-2 rounded-sm justify-between space-x-3 items-center"
              >
                <InterventionDetailsBox>
                  <InterventionGroup
                    codeGroup={intervention.codeGroup}
                    code={intervention.code}
                  />
                  <InterventionPeriod period={intervention.period} />
                  <InterventionDescription
                    description={intervention.description}
                  />
                </InterventionDetailsBox>
                <div className="border p-2">
                  <p>{intervention.value}</p>
                </div>
              </div>
            ))}{" "}
          </div>
        ))}
      </div>
      <div className="p-6 flex">
        <Button onClick={() => reactToPrintFn()}>Print</Button>
      </div>
    </>
  );
}
