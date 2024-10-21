"use client";

import { useTechnicians } from "@/hook/useTechnician";

export default function TechnicianList() {
  const { data } = useTechnicians();
  console.log(data);
  return <></>;
}
