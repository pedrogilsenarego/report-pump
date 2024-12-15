/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useIntervention } from "./useIntervention";

export default function Intervention() {
  const { intervention } = useIntervention();
  console.log(intervention.data);
  return <></>;
}
