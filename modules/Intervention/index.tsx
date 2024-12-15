/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useRef } from "react";
import { useIntervention } from "./useIntervention";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";

export default function Intervention() {
  const { intervention } = useIntervention();
  console.log(intervention.data);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  return (
    <>
      <div
        ref={contentRef}
        style={{ rowGap: "10px" }}
        className="p-6 flex flex-col"
      >
        {intervention?.data?.map((intervention, index: number) => {
          return (
            <div
              key={index}
              className="border flex p-2 rounded-sm justify-between"
            >
              <div className="flex gap-2">
                <p>
                  {intervention.codeGroup}
                  {intervention.codeSubgroup}
                  {intervention.code}
                </p>
                <p>{intervention.description}</p>
              </div>
              <div>
                <p>{intervention.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-6 flex">
        <Button onClick={() => reactToPrintFn()}>Print</Button>
      </div>
    </>
  );
}
