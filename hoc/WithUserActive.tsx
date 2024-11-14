"use client";

import { RouterKeys } from "@/constants/router";
import { useUser } from "@/hook/useUser";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function WithUserActive({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!user.isLoading && user?.data?.active === false) {
      if (user.data.role === 2 || user.data.role === 3) {
        router.push(RouterKeys.USER_REQUIRE_ACTIVATION);
      } else {
        router.push(RouterKeys.UPDATE_PASSWORD);
      }
    }
  }, [router, user]);

  return <>{user.data?.active === true && children}</>;
}
