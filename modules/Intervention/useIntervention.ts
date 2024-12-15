/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useInterventionResult } from "@/hook/useInterventions";
import { useParams, useRouter } from "next/navigation";

export const useIntervention = () => {
  const params = useParams();
  const { interventionId } = params;

  const interventionIdParam = interventionId
    ? parseInt(interventionId as string)
    : undefined;
  const intervention = useInterventionResult(interventionIdParam);

  return {
    intervention,
  };
};
