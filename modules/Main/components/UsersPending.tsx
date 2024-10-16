"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsersPending } from "@/hook/useUser";
import { User } from "@/types/user.types";

export default function UsersPending() {
  const usersPending = useUsersPending();
  return (
    <Card x-chunk="dashboard-01-chunk-5">
      <CardHeader>
        <CardTitle>Users Awaiting Accept</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {usersPending.data?.map((user: User) => {
          return (
            <div key={user.id} className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {user.display_name}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto font-medium">
                {new Date(user.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
