"use client";

import { useUser } from "@/hook/useUser";
import { ReactNode } from "react";

export default function WithAdmin({ children }: { children: ReactNode }) {
  const user = useUser();

  if (user?.data?.role !== 1) return;
  return <>{children}</>;
}
