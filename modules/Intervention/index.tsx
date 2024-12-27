/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useRef } from "react";
import { useIntervention } from "./useIntervention";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { groupByCodeGroup } from "@/utils/checklist";
import {
  InterventionBox,
  InterventionDescription,
  InterventionDetailsBox,
  InterventionGroup,
  InterventionGroupTitle,
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
            <InterventionGroupTitle group={group} />
            {interventions.map((intervention: any, index: number) => (
              <InterventionBox key={index}>
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
              </InterventionBox>
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
