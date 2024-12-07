/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useNewIntervention } from "./useNewIntervention";

export default function NewIntervention() {
  const { checklistData } = useNewIntervention();

  return (
    <div className="p-6">
      <h2>New Intervention</h2>
      <div>
        {checklistData?.[0].actions?.map((action, index) => {
          return (
            <Card key={index}>
              <CardContent>
                <p>
                  {action.codeGroup}
                  {action.codeSubGroup}
                  {action.code}
                </p>
                <p>{action.pumpType}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
