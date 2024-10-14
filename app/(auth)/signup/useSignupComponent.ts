"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupType } from "./validation";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "@/actions/clientActions/userActions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { RouterKeys } from "@/constants/router";

export default function useAuthComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const form = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      username: undefined,
    },
  });

  const { mutate: signupMutation, isPending } = useMutation({
    mutationFn: signupUser,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: (data: string) => {
      toast({
        variant: "default",
        title: "User created with success",
        description: data,
      });
      router.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}${
          next ? next : RouterKeys.MAIN
        }`
      );

      form.reset();
    },
  });

  function onSubmit(data: SignupType) {
    signupMutation(data);
  }

  return { form, onSubmit, isPending };
}