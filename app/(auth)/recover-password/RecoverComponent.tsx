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

export default function SignupComponent() {
  const { form, onSubmit, isPending } = useSignupComponent();
  return (
    <div className="w-1/2 h-screen rounded-3xl border p-32 space-y-5 relative bg-background flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-center">Recover password</h1>
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
  );
}
