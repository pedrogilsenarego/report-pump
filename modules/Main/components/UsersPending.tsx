"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { keyRoles } from "@/constants/roles";
import { useUsersPending } from "@/hook/useUser";
import { User } from "@/types/user.types";

export default function UsersPending() {
  const usersPending = useUsersPending();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Awaiting Accept</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8" style={{ gap: "20px" }}>
        {usersPending.data?.map((user: User) => {
          return (
            <div
              key={user.id}
              className="flex gap-4 border p-2 rounded-sm"
              style={{ gap: "20px" }}
            >
              <div
                className="grid gap-1"
                style={{ justifyContent: "space-between" }}
              >
                <p className="text-sm font-medium leading-none">
                  {user.display_name}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div
                style={{ justifyContent: "space-between" }}
                className="ml-auto font-medium text-xs flex flex-col space-between"
              >
                <p style={{ whiteSpace: "nowrap" }}>
                  {new Date(user.created_at).toLocaleString()}
                </p>
                <p className="text-sm" style={{ textTransform: "capitalize" }}>
                  {keyRoles.find((role) => role.id === user.role)?.value}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
