"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  logoutUser,
  updatePassword,
} from "@/actions/clientActions/userActions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { RouterKeys } from "@/constants/router";
import { resetSchema, ResetType } from "./validation";
import { QueryKeys } from "@/constants/queryKeys";

export default function useAuthComponent() {
  const { toast } = useToast();
  const router = useRouter();

  const queryClient = useQueryClient();
  const form = useForm<ResetType>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: undefined,
      confirmPassword: undefined,
    },
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logoutUser,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Something went wrong",
      });
    },
    onSuccess: () => {
      router.push(RouterKeys.LOGIN);
      queryClient.removeQueries({ queryKey: [QueryKeys.USER] });
      queryClient.removeQueries({ queryKey: [QueryKeys.USERS_PENDING] });
      queryClient.removeQueries({ queryKey: ["session"] });
    },
  });

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: updatePassword,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: () => {
      logoutMutation();
      form.reset();
    },
  });

  function onSubmit(data: ResetType) {
    updateMutation(data);
  }

  return { form, onSubmit, isPending };
}
