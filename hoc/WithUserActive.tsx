"use client";

import { RouterKeys } from "@/constants/router";
import { useUser } from "@/hook/useUser";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function WithUserActive({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useUser();

  if (user?.data?.active === false)
    router.push(RouterKeys.USER_REQUIRE_ACTIVATION);
  return <>{children}</>;
}
