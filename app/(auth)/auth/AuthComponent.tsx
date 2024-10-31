"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";
//import { Divider } from "@/components/ui/divider";
import useAuthComponent from "./useAuthComponent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

//import SSO from "@/modules/Auth/SSO";

export default function AuthComponent() {
  const { form, onSubmit, isPending } = useAuthComponent();

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-1/2 h-screen  p-32 space-y-5 relative bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        {/* <SSO /> 
      <div className="flex gap-4 items-center w-full">
        <Divider />
        <p className="text-nowrap text-slate-200 text-xs">Or Log In With</p>
        <Divider />
      </div>*/}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
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
                    <Input placeholder="password" {...field} type="password" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Link href={"/recover-password"}>
              <p className="text-xs underline cursor-pointer mt-2">
                Forgot Password?
              </p>
            </Link>
            <Button
              isLoading={isPending}
              className=" w-full flex items-center"
              variant="default"
              type="submit"
            >
              Login
            </Button>
          </form>
        </Form>

        <Link href={"/signup"}>
          <p className="text-sm text-gray-300">
            New here? <span className="text-blue-300">Create an Account</span>
          </p>{" "}
        </Link>
        <div className="glowbox -z-10"></div>
      </div>
    </div>
  );
}
