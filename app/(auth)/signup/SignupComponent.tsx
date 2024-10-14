"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Divider } from "@/components/ui/divider";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSignupComponent from "./useSignupComponent";
import SSO from "@/modules/Auth/SSO";

export default function SignupComponent() {
  const { form, onSubmit, isPending } = useSignupComponent();
  return (
    <div className="w-1/2 h-screen rounded-3xl border p-32 space-y-5 relative bg-background flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-center">Join CorrespondR</h1>
      <SSO />
      <div className="flex gap-4 items-center w-full">
        <Divider />
        <p className="text-nowrap text-slate-200 text-xs">
          Or Create New Account
        </p>
        <Divider />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 w-full"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="E-mail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="E-mail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Password" {...field} type="password" />
                </FormControl>
                <p className="text-xs mt-2">
                  Your password must be at least 8 characters long
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm Password"
                    {...field}
                    type="password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs mt-2">
            By signining up you agree to our{" "}
            <u className="cursor-pointer">Terms of Service</u> &{" "}
            <u className="cursor-pointer">Privacy Policy</u>
          </p>
          <Button
            isLoading={isPending}
            className=" w-full flex items-center"
            variant="default"
            type="submit"
          >
            Agreed and Signup
          </Button>
        </form>
      </Form>

      <div className="glowbox -z-10"></div>
    </div>
  );
}
