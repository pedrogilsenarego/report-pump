/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupType } from "./validation";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "@/actions/clientActions/userActions";

import { useRouter, useSearchParams } from "next/navigation";
import { RouterKeys } from "@/constants/router";
import { useToast } from "@/hooks/use-toast";

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
      role: undefined,
      address: undefined,
      nameCompany: undefined,
      phone: undefined,
      defaultLang: undefined,
      country: undefined,
    },
  });

  const { mutate: signupMutation, isPending } = useMutation({
    mutationFn: signupUser,
    onError: (data: string) => {
      console.log(data);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: (data: string) => {
      toast({
        variant: "default",
        title:
          "User created with success. Visit your email for confirmation, also you will have to wait for an admin to validate your registration",
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
