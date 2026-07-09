"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useState } from "react";

import ChangeLanguage from "@/components/change-language";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SignupModal from "@/modules/Auth/SignupModal";
import { i18n } from "@/translations/i18n";

import useLogin from "./useLogin";

export default function Landscape() {
  const { form, onSubmit, isPending } = useLogin();
  const [openSignup, setOpenSignup] = useState(false);

  return (
    <div className="w-full h-full flex justify-center">
      <div className="absolute top-4 right-4 z-10">
        <ChangeLanguage type="dropdown" />
      </div>
      <div className="w-1/2 h-screen  p-32 space-y-5 relative bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">FIREPUMP25</h1>
          <h2 className="text-lg text-muted-foreground">
            {i18n.t("landingPage.subtitle")}
          </h2>
        </div>

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
                    <Input
                      placeholder={i18n.t("landingPage.emailPlaceholder")}
                      {...field}
                    />
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
                    <Input
                      placeholder={i18n.t("landingPage.passwordPlaceholder")}
                      {...field}
                      type="password"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Link href={"/recover-password"}>
              <p className="text-xs underline cursor-pointer mt-2">
                {i18n.t("landingPage.forgotPassword")}
              </p>
            </Link>
            <Button
              isLoading={isPending}
              className=" w-full flex items-center"
              variant="default"
              type="submit"
            >
              {i18n.t("landingPage.access")}
            </Button>
          </form>
        </Form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setOpenSignup(true)}
        >
          {i18n.t("landingPage.newUser")}
        </Button>
        <SignupModal open={openSignup} onOpenChange={setOpenSignup} />
        <div className="glowbox -z-10"></div>
      </div>
    </div>
  );
}
