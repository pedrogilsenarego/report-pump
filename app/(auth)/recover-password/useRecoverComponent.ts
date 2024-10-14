"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  recoverPassword,
  signupUser,
} from "@/actions/clientActions/userActions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { RouterKeys } from "@/constants/router";
import { RecoverPwd, recoverPwdSchema } from "./validation";

export default function useAuthComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const form = useForm<RecoverPwd>({
    resolver: zodResolver(recoverPwdSchema),
    defaultValues: {
      email: undefined,
    },
  });

  const { mutate: recoverMutation, isPending } = useMutation({
    mutationFn: recoverPassword,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: (data: any) => {
      toast({
        variant: "default",
        title: "Recover password",
        description: "Please visit your e-mail for password recovery",
      });

      form.reset();
    },
  });

  function onSubmit(data: RecoverPwd) {
    recoverMutation(data);
  }

  return { form, onSubmit, isPending };
}
