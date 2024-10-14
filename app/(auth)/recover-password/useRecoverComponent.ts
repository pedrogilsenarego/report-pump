"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { recoverPassword } from "@/actions/clientActions/userActions";
import { useToast } from "@/components/ui/use-toast";
import { RecoverPwd, recoverPwdSchema } from "./validation";

export default function useAuthComponent() {
  const { toast } = useToast();

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
    onSuccess: () => {
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
