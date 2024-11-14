"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSignupComponent from "./useRecoverComponent";

export default function ResetComponent() {
  const { form, onSubmit, isPending, user } = useSignupComponent();
  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-1/2 h-screen p-32 space-y-5 relative bg-background flex flex-col items-center justify-center">
        {!user.data?.active && (
          <h1 className="text-2xl font-bold text-center">
            This is your first login please reset your password
          </h1>
        )}
        <h1 className="text-2xl font-bold text-center">Update password</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Password" {...field} type="password" />
                  </FormControl>

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
            <Button
              isLoading={isPending}
              className=" w-full flex items-center"
              variant="default"
              type="submit"
            >
              Proceed
            </Button>
          </form>
        </Form>

        <div className="glowbox -z-10"></div>
      </div>
    </div>
  );
}
