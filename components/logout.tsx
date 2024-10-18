"use client";

import { logoutUser } from "@/actions/clientActions/userActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { QueryKeys } from "@/constants/queryKeys";
import { RouterKeys } from "@/constants/router";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logoutUser,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Something went wrong",
      });
    },
    onSuccess: () => {
      router.push(RouterKeys.HOME);
      queryClient.removeQueries({ queryKey: [QueryKeys.USER] });
      queryClient.removeQueries({ queryKey: [QueryKeys.USERS_PENDING] });
      queryClient.removeQueries({ queryKey: ["session"] });
    },
  });

  return (
    <Button isLoading={isPending} onClick={() => logoutMutation()}>
      Logout
    </Button>
  );
}
