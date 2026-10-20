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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTechnicians } from "@/hook/useTechnician";
import { updateTechnician } from "@/actions/serverActions/technician.actions";
import { isActiveTechnician } from "@/constants/condition";
import { Technician } from "@/types/technician.types";
import { i18n } from "@/translations/i18n";

const EditTechnicianSchema = z.object({
  name: z.string().trim().min(1, { message: i18n.t("pumpGroup.required") }),
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
  function: z.string().optional(),
  certification: z.string().optional(),
});

type EditTechnicianType = z.infer<typeof EditTechnicianSchema>;

const toForm = (technician: Technician): EditTechnicianType => ({
  name: technician.name ?? "",
  phone: technician.phone ?? "",
  function: technician.function ?? "",
  certification: technician.certification ?? "",
});

/**
 * Screen#11 — edit a customer technician (Action#17). Offered on active rows only, as
 * PopUp#20's selector lists `Condition = 1` only.
 */
export default function EditTechnician({
  technician,
}: {
  technician: Technician;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { refetch } = useTechnicians();

  const form = useForm<EditTechnicianType>({
    resolver: zodResolver(EditTechnicianSchema),
    defaultValues: toForm(technician),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: EditTechnicianType) => {
      const response = await updateTechnician({
        profileId: technician.id,
        ...values,
      });
      if (!response.success) throw new Error(response.message);
      return response.message;
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: i18n.t("technicians.updateError"),
        description: error.message,
      });
    },
    onSuccess: () => {
      toast({ title: i18n.t("technicians.updated") });
      setOpen(false);
      refetch();
    },
  });

  function onOpenChange(next: boolean) {
    if (next) form.reset(toForm(technician));
    setOpen(next);
  }

  if (!isActiveTechnician(technician.condition)) return null;

  const text = (
    name: keyof EditTechnicianType,
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
        <Button variant="ghost" size="sm">
          {i18n.t("technicians.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className="space-y-4 w-full"
          >
            <DialogHeader>
              <DialogTitle>{i18n.t("technicians.editTitle")}</DialogTitle>
              <DialogDescription>
                {i18n.t("technicians.editDescription")}
              </DialogDescription>
            </DialogHeader>

            {text("name", `${i18n.t("technicians.name")} (*)`)}
            <FormItem>
              <FormLabel>{i18n.t("technicians.email")}</FormLabel>
              <Input value={technician.email ?? ""} disabled readOnly />
            </FormItem>
            {text("phone", i18n.t("technicians.phone"))}
            {text("function", i18n.t("technicians.function"), true)}
            {text("certification", i18n.t("technicians.certification"), true)}

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
