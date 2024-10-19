"use client";

import { KeyRoles } from "@/constants/roles";
import { useUser } from "@/hook/useUser";
import { ReactNode } from "react";

export default function WithRole({
  children,
  roleKey,
}: {
  children: ReactNode;
  roleKey: KeyRoles[];
}) {
  const user = useUser();
  if (!user?.data?.role) return;

  return <>{roleKey.includes(user?.data?.role) && children}</>;
}
