"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, SigninType } from "./validation";
import { useMutation } from "@tanstack/react-query";
import { signinUser } from "@/actions/clientActions/userActions";

import { useRouter, useSearchParams } from "next/navigation";
import { RouterKeys } from "@/constants/router";
import { useUser } from "@/hook/useUser";
import useSession from "@/hook/useSession";
import { useToast } from "@/hooks/use-toast";

export default function useAuthComponent() {
  const { toast } = useToast();
  const user = useUser();
  const session = useSession();
  const params = useSearchParams();
  const next = params.get("next");
  const router = useRouter();
  const form = useForm<SigninType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: signinUser,
    onError: (data: string) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data,
      });
    },
    onSuccess: () => {
      user.refetch();
      session.refetch();
      router.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}${
          next ? next : RouterKeys.MAIN
        }`
      );

      form.reset();
    },
  });

  function onSubmit(data: SigninType) {
    loginMutation(data);
  }

  return { form, onSubmit, isPending };
}
