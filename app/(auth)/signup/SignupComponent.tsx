/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSignupComponent from "./useSignupComponent";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { langKeys } from "@/constants/lang";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountrySelect from "@/components/ui/country-selector";

import StepperCounter from "@/components/stepper";

export default function SignupComponent() {
  const { form, onSubmit, isPending, step, setStep, disableNext } =
    useSignupComponent();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full h-screen bg-primary p-10">
          <div className="rounded-3xl border p-10 space-y-5 relative bg-background  flex flex-col h-full  min-h-full">
            <h1 className="text-4xl font-bold text-center">
              Join Equitotal - {step === 1 && "Type of user"}
              <span className="text-foreground/45">
                {step === 2 && "Company General"}
                {step === 3 && "Company Details"}
                {step === 4 && "Login Details"}
              </span>
            </h1>
            <div className="min-h-fit flex-1">
              <div className="flex flex-col h-full justify-between">
                <div className="p-32 flex flex-col justify-center items-center h-full">
                  {step === 1 && (
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-6"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    className="h-8 w-8"
                                    value="2"
                                  />
                                </FormControl>
                                <FormLabel className="font-bold text-4xl cursor-pointer">
                                  Are you a Customer?
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    className="h-8 w-8"
                                    value="3"
                                  />
                                </FormControl>
                                <FormLabel className="font-bold text-4xl cursor-pointer">
                                  Are you a Supplyer?
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {step === 2 && (
                    <div className="flex flex-col align-top space-y-8 ">
                      <FormField
                        control={form.control}
                        name="nameCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-2xl">
                              What is name of your company?
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of the company*"
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
                            <FormLabel className="text-2xl">
                              Where is your company?
                            </FormLabel>
                            <FormControl {...field}>
                              <CountrySelect />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-2xl">
                              Who is the responsible?
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Responsible name*"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {step === 3 && (
                    <div className="flex flex-col align-top space-y-8 ">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-2xl">
                              Where can we find you?
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Address*" {...field} />
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
                            <FormLabel className="text-2xl">
                              How can we contact you?
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Phone/Celular" {...field} />
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
                            <FormLabel className="text-2xl">
                              Reports language?
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Default language for reports*" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {langKeys.map((lang) => {
                                  return (
                                    <SelectItem key={lang.id} value={lang.id}>
                                      {lang.value}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This language will be used to create the reports,
                              but can be changed later.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {step === 4 && (
                    <div className="flex flex-col align-top space-y-8">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-2xl">
                              And your email?
                            </FormLabel>
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
                            <FormLabel className="text-2xl">
                              Choose a password
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Password"
                                {...field}
                                type="password"
                              />
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
                            <FormLabel className="text-2xl">
                              Confirm the password
                            </FormLabel>
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
                    </div>
                  )}
                </div>
                <div className="w-full flex justify-between items-center">
                  <div style={{ width: "20%" }}></div>
                  <StepperCounter currentStep={step} totalSteps={4} />
                  <div
                    style={{ width: "20%" }}
                    className="flex justify-end space-x-2"
                  >
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep((prev) => prev - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    {step !== 4 && (
                      <Button
                        type="button"
                        onClick={() => setStep((prev) => prev + 1)}
                        disabled={disableNext}
                      >
                        Next
                      </Button>
                    )}
                    {step === 4 && (
                      <Button
                        isLoading={isPending}
                        variant="default"
                        type="submit"
                      >
                        Agreed and Signup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
