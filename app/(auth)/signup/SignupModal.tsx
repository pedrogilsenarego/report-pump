"use client";

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
import { langKeys } from "@/constants/lang";
import {
  StepperFormModal,
  type StepperFormStep,
} from "@/components/organisms/StepperFormModal";
import { i18n } from "@/translations/i18n";

import useSignupComponent from "./useSignupComponent";
import type { SignupType } from "./validation";
import Terms from "./Terms";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SignupModal({ open, onOpenChange }: Props) {
  const {
    form,
    onSubmit,
    isPending,
    terms,
    termsAccepted,
    setTermsAccepted,
    setOpenTerms,
  } = useSignupComponent();

  // Enter on the last step can bypass the disabled button, so guard the submit.
  const handleSubmit = (data: SignupType) => {
    if (!termsAccepted) return;
    onSubmit(data);
  };

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
                      <RadioGroupItem className="h-6 w-6" value="2" />
                    </FormControl>
                    <FormLabel className="font-semibold text-xl cursor-pointer">
                      {i18n.t("signup.customer")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem className="h-6 w-6" value="3" />
                    </FormControl>
                    <FormLabel className="font-semibold text-xl cursor-pointer">
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
          <div
            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow cursor-pointer"
            onClick={() => setOpenTerms(true)}
          >
            <Checkbox checked={termsAccepted} />
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                {i18n.t("signup.termsAgree")}{" "}
                <u className="cursor-pointer">
                  {i18n.t("signup.termsService")}
                </u>{" "}
                {i18n.t("signup.termsAnd")}{" "}
                <u className="cursor-pointer">
                  {i18n.t("signup.termsPrivacy")}
                </u>
              </FormLabel>
              <FormDescription>{i18n.t("signup.termsHelper")}</FormDescription>
            </div>
          </div>
          <Terms
            onRead={() => setTermsAccepted(true)}
            open={terms}
            onOpenChange={setOpenTerms}
            read={termsAccepted}
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
      onSubmit={handleSubmit}
      submitButtonText={i18n.t("signup.submit")}
      isSubmitting={isPending}
      submitDisabled={!termsAccepted}
    />
  );
}
