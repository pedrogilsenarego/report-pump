"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsersPending } from "@/hook/useUser";
import { i18n } from "@/translations/i18n";
import { User } from "@/types/user.types";
import UserPending from "./UserPending";
import { useState } from "react";
import UserPendingDetail from "./UserPendingDetail";

export default function UsersPending() {
  const usersPending = useUsersPending();
  const [openUserPendingDetail, setOpenUserPendingDetail] =
    useState<boolean>(false);
  const [selectedIndexUser, setSelectedUserIndex] = useState<number | null>(
    null
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{i18n.t("dashboard.usersPendingApproval")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8" style={{ gap: "20px" }}>
          {usersPending.data?.map((user: User, index) => {
            return (
              <div
                key={user.id}
                className="cursor-pointer"
                onClick={() => {
                  setOpenUserPendingDetail(true);
                  setSelectedUserIndex(index);
                }}
              >
                <UserPending user={user} />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <UserPendingDetail
        userIndex={selectedIndexUser}
        open={openUserPendingDetail}
        onOpenChange={setOpenUserPendingDetail}
      />
    </>
  );
}
