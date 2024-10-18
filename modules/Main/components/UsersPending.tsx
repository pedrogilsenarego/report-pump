"use client";

import { acceptUserPending } from "@/actions/clientActions/userActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { keyRoles } from "@/constants/roles";
import { useUsersPending } from "@/hook/useUser";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user.types";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";

export default function UsersPending() {
  const usersPending = useUsersPending();
  const { toast } = useToast();
  const { mutate: acceptNewUserMutation, isPending } = useMutation({
    mutationFn: acceptUserPending,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: () => {
      usersPending.refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Awaiting Accept</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8" style={{ gap: "20px" }}>
        {usersPending.data?.map((user: User) => {
          return (
            <div key={user.id} className="flex gap-2 items-center">
              <div
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
                  <p
                    className="text-sm"
                    style={{ textTransform: "capitalize" }}
                  >
                    {keyRoles.find((role) => role.id === user.role)?.value}
                  </p>
                </div>
              </div>
              <Button
                onClick={() =>
                  acceptNewUserMutation({
                    targetUserId: user.id,
                  })
                }
                isLoading={isPending}
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
