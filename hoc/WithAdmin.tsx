"use client";

import { useUser } from "@/hook/useUser";
import { ReactNode } from "react";

export default function WithAdmin({ children }: { children: ReactNode }) {
  const user = useUser();

  return <>{user?.data?.role === 1 && children}</>;
}
