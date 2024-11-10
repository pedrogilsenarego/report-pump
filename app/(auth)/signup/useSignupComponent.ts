/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useState } from "react";
import {
  addCompany,
  deleteCompany,
} from "@/actions/clientActions/companies.actions";

export default function useAuthComponent() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [terms, setOpenTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const disableNext =
    (step === 1 && form.watch("role") === undefined) ||
    (step === 2 &&
      (form.watch("nameCompany") === undefined ||
        form.watch("country") === undefined ||
        form.watch("username") === undefined)) ||
    (step === 3 &&
      (form.watch("address") === undefined ||
        form.watch("defaultLang") === undefined));

  const { mutate: signupMutation, isPending: isCreatingUser } = useMutation({
    mutationFn: signupUser,
    onError: (data: any) => {
      console.log(data);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "",
      });
      deleteCompany(data.companyId);
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

  const { mutate: createCompanyMutation, isPending: isCreatingCompany } =
    useMutation({
      mutationFn: addCompany,
      onError: (data: string) => {
        console.log(data);
        // toast({
        //   variant: "destructive",
        //   title: "Uh oh! Something went wrong.",
        //   description: data,
        // });
      },
      onSuccess: (data: any) => {
        const password = form.watch("password");
        console.log(data);
        signupMutation({ ...data, password, username: data.nameCompany });
      },
    });

  function onSubmit(data: SignupType) {
    console.log(data);
    createCompanyMutation(data);
    //signupMutation(data);
  }

  const isPending = isCreatingCompany || isCreatingUser;

  return {
    form,
    onSubmit,
    isPending,
    step,
    setStep,
    disableNext,
    terms,
    termsAccepted,
    setTermsAccepted,
    setOpenTerms,
  };
}
