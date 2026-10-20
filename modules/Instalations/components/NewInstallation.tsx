"use client";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import useNewInstallation from "./useNewInstallation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsibles } from "@/hook/useResponsibles";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Installation } from "@/types/installation.types";
import { i18n } from "@/translations/i18n";

const t = (key: string) => i18n.t(`installations.${key}`);

/**
 * Screen#09 INSTALLATION — *Create new* (Action#16), or given `installation`, *Edit existing*
 * (Action#17/#18). The responsible select doubles as SF#260 *Create / Change Responsable*:
 * the spec's flow only ever links an existing INST_RESPONSABLE to the installation, which is
 * what changing it here does.
 */
export default function NewInstallation({
  installation,
}: {
  installation?: Installation;
}) {
  const { form, onSubmit, isPending, openModal, onOpenChange } =
    useNewInstallation(installation);
  const { data: responsibles, isLoading: isLoadingResponsibles } =
    useResponsibles();
  const isEdit = !!installation;

  return (
    <Dialog open={openModal} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            {t("edit")}
          </Button>
        ) : (
          <Button variant="outline">{t("new")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <DialogHeader>
              <DialogTitle>{t(isEdit ? "editTitle" : "newTitle")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")} (*)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsibleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("responsible")} (*)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      {isLoadingResponsibles ? (
                        <div className="flex items-center justify-center">
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectResponsible")} />
                        </SelectTrigger>
                      )}
                    </FormControl>
                    <SelectContent>
                      {responsibles?.map((responsible) => (
                        <SelectItem
                          key={responsible.id}
                          value={String(responsible.id)}
                        >
                          {responsible.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t("responsibleHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("area")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t("address")}</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
