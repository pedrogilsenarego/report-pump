/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useNewIntervention } from "./useNewIntervention";
import { ExclusiveMultiToggleForm } from "@/components/ui/multi-exclusive-toggle";
import { Button } from "@/components/ui/button";

export default function NewIntervention() {
  const { checklistData, control, handleSubmit, onSubmit, isSubmitting } =
    useNewIntervention();

  const options = [
    { value: "error", label: "Falha" },
    { value: "ne", label: "N/E" },
    { value: "ok", label: "OK" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-6">
        <h2>New Intervention</h2>
        <div style={{ rowGap: "10px" }} className="flex flex-col gap-y-2 mt-2">
          {checklistData?.[0].actions?.map((action, index) => {
            console.log(action);
            return (
              <div
                key={index}
                className="border flex p-2 rounded-sm justify-between"
              >
                <div className="flex gap-2">
                  <p>
                    {action.codeGroup}
                    {action.codeSubGroup}
                    {action.code}
                  </p>
                  <p>{action.description}</p>
                </div>
                <ExclusiveMultiToggleForm
                  name={`action_${index}`}
                  control={control}
                  options={options}
                />
              </div>
            );
          })}
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Intervention
          </Button>
        </div>
      </div>
    </form>
  );
}
