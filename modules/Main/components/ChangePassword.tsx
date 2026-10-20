"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { changePassword } from "@/actions/clientActions/userActions";
import { i18n } from "@/translations/i18n";

/** Same minimum as signup, so a password valid at registration stays valid here. */
const MIN_LENGTH = 8;

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: i18n.t("pumpGroup.required") }),
    newPassword: z.string().min(MIN_LENGTH, {
      message: i18n.t("password.tooShort", { min: MIN_LENGTH }),
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    // The spec's SF#A1 wording.
    message: i18n.t("password.noMatch"),
    path: ["confirmPassword"],
  });

type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

const EMPTY = { oldPassword: "", newPassword: "", confirmPassword: "" };

/** Change password `(P4)`, off the menu header: old -> new -> confirm. */
export default function ChangePassword() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: EMPTY,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ChangePasswordType) =>
      changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }),
    onError: (error: string) => {
      if (error === "WRONG_PASSWORD") {
        form.setError("oldPassword", {
          message: i18n.t("password.wrongOld"),
        });
        return;
      }
      toast({
        variant: "destructive",
        title: i18n.t("password.error"),
        description: error,
      });
    },
    onSuccess: () => {
      toast({ title: i18n.t("password.changed") });
      setOpen(false);
    },
  });

  function onOpenChange(next: boolean) {
    if (next) form.reset(EMPTY);
    setOpen(next);
  }

  const passwordField = (name: keyof ChangePasswordType, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="password" autoComplete="off" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{i18n.t("password.button")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className="space-y-4 w-full"
          >
            <DialogHeader>
              <DialogTitle>{i18n.t("password.title")}</DialogTitle>
              <DialogDescription>
                {i18n.t("password.description", { min: MIN_LENGTH })}
              </DialogDescription>
            </DialogHeader>
            {passwordField("oldPassword", i18n.t("password.old"))}
            {passwordField("newPassword", i18n.t("password.new"))}
            {passwordField("confirmPassword", i18n.t("password.confirm"))}
            <DialogFooter>
              <Button isLoading={isPending} type="submit">
                {i18n.t("common.ok")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
