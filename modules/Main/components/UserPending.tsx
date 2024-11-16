"use client";

import { acceptUserPending } from "@/actions/clientActions/userActions";
import { Button } from "@/components/ui/button";
import { keyRoles } from "@/constants/roles";
import { useUsersPending } from "@/hook/useUser";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user.types";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";

type Props = {
  user: User;
};

export default function UserPending(props: Props) {
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
    <div
      key={props.user.id}
      className="flex gap-2 items-center justify-between"
    >
      <div
        className="flex gap-4 border p-2 rounded-sm w-full"
        style={{ gap: "20px" }}
      >
        <div className="grid gap-1" style={{ justifyContent: "space-between" }}>
          <p className="text-sm font-medium leading-none">
            {props.user.display_name}
          </p>
          <p className="text-sm text-muted-foreground">{props.user.email}</p>
        </div>
        <div
          style={{ justifyContent: "space-between" }}
          className="ml-auto font-medium text-xs flex flex-col space-between"
        >
          <p style={{ whiteSpace: "nowrap" }}>
            {new Date(props.user.created_at).toLocaleString()}
          </p>
          <p className="text-sm" style={{ textTransform: "capitalize" }}>
            {keyRoles.find((role) => role.id === props.user.role)?.value}
          </p>
        </div>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          acceptNewUserMutation({
            targetUserId: props.user.id,
            companyId: props.user.company_id,
          });
        }}
        isLoading={isPending}
      >
        <CheckIcon className="mr-2 h-4 w-4" />
        Accept
      </Button>
    </div>
  );
}
