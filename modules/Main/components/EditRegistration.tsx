"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CountrySelect from "@/components/ui/country-selector";
import { useToast } from "@/hooks/use-toast";
import { langKeys } from "@/constants/lang";
import { QueryKeys } from "@/constants/queryKeys";
import {
  getMyRegistration,
  updateMyRegistration,
} from "@/actions/serverActions/registration.actions";
import { i18n } from "@/translations/i18n";

const required = z.string().trim().min(1, { message: i18n.t("pumpGroup.required") });

const RegistrationSchema = z.object({
  companyName: required,
  address: required,
  country: required,
  defaultLang: required,
  responsibleName: required,
  phone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
          val
        ),
      { message: i18n.t("technicians.invalidPhone") }
    ),
});

type RegistrationType = z.infer<typeof RegistrationSchema>;

const EMPTY: RegistrationType = {
  companyName: "",
  address: "",
  country: "",
  defaultLang: "",
  responsibleName: "",
  phone: "",
};

/**
 * SF#210 *Edit Record* (customer) / SF#131 *Edit Registration* (provider, Screen#08). The
 * same registration fields as signup, minus the email and the role.
 */
export default function EditRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const registration = useQuery({
    queryKey: [QueryKeys.REGISTRATION],
    queryFn: () => getMyRegistration(),
    enabled: open,
  });

  const form = useForm<RegistrationType>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: EMPTY,
  });

  // Seed the form once the record arrives — and again whenever the dialog reopens.
  const loaded = registration.data;
  const [seededFor, setSeededFor] = useState<typeof loaded>(undefined);
  if (open && loaded && seededFor !== loaded) {
    setSeededFor(loaded);
    form.reset({
      companyName: loaded.companyName,
      address: loaded.address,
      country: loaded.country,
      defaultLang: loaded.defaultLang,
      responsibleName: loaded.responsibleName,
      phone: loaded.phone,
    });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: RegistrationType) => {
      const response = await updateMyRegistration({
        ...values,
        phone: values.phone ?? "",
      });
      if (!response.success) throw new Error(response.message);
      return response.message;
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: i18n.t("registration.error"),
        description: error.message,
      });
    },
    onSuccess: () => {
      toast({ title: i18n.t("registration.updated") });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [QueryKeys.REGISTRATION] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USER] });
    },
  });

  function onOpenChange(next: boolean) {
    if (next) setSeededFor(undefined);
    setOpen(next);
  }

  const text = (
    name: keyof RegistrationType,
    label: string,
    multiline?: boolean
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea className="resize-none" {...field} />
            ) : (
              <Input {...field} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{i18n.t("registration.button")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className="space-y-4 w-full"
          >
            <DialogHeader>
              <DialogTitle>{i18n.t("registration.title")}</DialogTitle>
              <DialogDescription>
                {i18n.t("registration.description")}
              </DialogDescription>
            </DialogHeader>

            {registration.isLoading ? (
              <p className="text-sm text-muted-foreground">
                {i18n.t("registration.loading")}
              </p>
            ) : !loaded ? (
              <p className="text-sm text-destructive">
                {i18n.t("registration.notAvailable")}
              </p>
            ) : (
              <>
                {text("companyName", `${i18n.t("signup.companyNameLabel")}`)}
                {text("address", `${i18n.t("signup.addressLabel")}`, true)}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{i18n.t("signup.countryLabel")}</FormLabel>
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultLang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{i18n.t("signup.reportsLangLabel")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={i18n.t(
                                "signup.reportsLangPlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {langKeys.map((lang) => (
                            <SelectItem key={lang.id} value={lang.id}>
                              {lang.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {text("responsibleName", i18n.t("signup.responsibleLabel"))}
                {text("phone", i18n.t("signup.phoneLabel"))}
                <FormItem>
                  <FormLabel>{i18n.t("technicians.email")}</FormLabel>
                  <Input value={loaded.email} disabled readOnly />
                </FormItem>
              </>
            )}

            <DialogFooter>
              <Button isLoading={isPending} type="submit" disabled={!loaded}>
                {i18n.t("common.ok")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
