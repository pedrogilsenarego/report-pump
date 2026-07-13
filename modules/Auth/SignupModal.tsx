"use client";

import { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountrySelect from "@/components/ui/country-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { langKeys } from "@/constants/lang";
import {
  StepperFormModal,
  type StepperFormStep,
} from "@/components/organisms/StepperFormModal";
import { i18n } from "@/translations/i18n";

import useSignupComponent from "./useSignupComponent";
import type { SignupType } from "./validation";
import AccessConditions from "./AccessConditions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SignupModal({ open, onOpenChange }: Props) {
  const { form, onSubmit, isPending } = useSignupComponent();

  const [openAccessConditions, setOpenAccessConditions] = useState(false);

  // The access conditions apply only to customer registrations (role "2").
  const isCustomer = form.watch("role") === "2";

  const steps: StepperFormStep<SignupType>[] = [
    {
      id: 1,
      title: i18n.t("signup.steps.userTypeTitle"),
      description: i18n.t("signup.steps.userTypeDescription"),
      fields: ["role"],
      content: (
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="2" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      {i18n.t("signup.customer")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="3" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      {i18n.t("signup.supplier")}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
    },
    {
      id: 2,
      title: i18n.t("signup.steps.companyTitle"),
      description: i18n.t("signup.steps.companyDescription"),
      fields: [
        "nameCompany",
        "address",
        "country",
        "defaultLang",
        "username",
        "phone",
        "email",
      ],
      // Customers must accept the access conditions before continuing. This is
      // handled here (not in `fields`) because a cross-field zod refine only
      // runs once the whole object parses, so it wouldn't surface while other
      // required fields are still empty.
      validate: () => {
        if (isCustomer && !form.getValues("accessConditions")) {
          form.setError("accessConditions", {
            message: i18n.t("signup.accessConditionsRequired"),
          });
          return false;
        }
        form.clearErrors("accessConditions");
        return true;
      },
      content: (
        <>
          <FormField
            control={form.control}
            name="nameCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.companyNameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.companyNamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.addressLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.addressPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.countryLabel")}</FormLabel>
                <FormControl {...field}>
                  <CountrySelect />
                </FormControl>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={i18n.t("signup.reportsLangPlaceholder")}
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
                <FormDescription>
                  {i18n.t("signup.reportsLangHelp")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.responsibleLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.responsiblePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.phoneLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.phonePlaceholder")}
                    {...field}
                  />
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
                <FormLabel>{i18n.t("signup.emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isCustomer && (
            <FormField
              control={form.control}
              name="accessConditions"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center gap-3 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) form.clearErrors("accessConditions");
                        }}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {i18n.t("signup.acceptAccessConditions")}
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setOpenAccessConditions(true)}
                    >
                      {i18n.t("signup.readAccessConditions")}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <AccessConditions
            open={openAccessConditions}
            onOpenChange={setOpenAccessConditions}
            onAccept={() =>
              form.setValue("accessConditions", true, {
                shouldValidate: true,
              })
            }
          />
        </>
      ),
    },
    {
      id: 3,
      title: i18n.t("signup.steps.loginTitle"),
      description: i18n.t("signup.steps.loginDescription"),
      fields: ["password", "confirmPassword"],
      content: (
        <>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.passwordPlaceholder")}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs mt-2">{i18n.t("signup.passwordHint")}</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n.t("signup.confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={i18n.t("signup.confirmPasswordPlaceholder")}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ),
    },
  ];

  return (
    <StepperFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={i18n.t("signup.title")}
      steps={steps}
      form={form}
      onSubmit={onSubmit}
      submitButtonText={i18n.t("signup.submit")}
      isSubmitting={isPending}
    />
  );
}
