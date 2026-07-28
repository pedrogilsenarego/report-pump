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
import { i18n } from "@/translations/i18n";
import useNewChecklist from "./useNewChecklist";

export default function NewChecklist() {
  const { form, onSubmit, openModal, setOpenModal, isPending, nextCode } =
    useNewChecklist();

  return (
    <Dialog open={openModal} onOpenChange={(value) => setOpenModal(value)}>
      <DialogTrigger asChild>
        <Button variant="outline">{i18n.t("newChecklist.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <DialogHeader>
              <DialogTitle>{i18n.t("newChecklist.title")}</DialogTitle>
              <DialogDescription>
                {i18n.t("newChecklist.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm font-medium">
                {i18n.t("newChecklist.reportNrLabel")}
              </span>
              <span className="text-sm">{nextCode}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t("newChecklist.dateLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={i18n.t("newChecklist.datePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t("newChecklist.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={i18n.t("newChecklist.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nfpaEd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{i18n.t("newChecklist.nfpaEdLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={i18n.t("newChecklist.nfpaEdPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyResp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {i18n.t("newChecklist.companyRespLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={i18n.t(
                        "newChecklist.companyRespPlaceholder"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameResp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{i18n.t("newChecklist.nameRespLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={i18n.t("newChecklist.nameRespPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t("newChecklist.phoneLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={i18n.t("newChecklist.phonePlaceholder")}
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
                    <FormLabel>{i18n.t("newChecklist.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={i18n.t("newChecklist.emailPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormDescription>
              {i18n.t("newChecklist.requiredFields")}
            </FormDescription>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                {i18n.t("common.cancel")}
              </Button>
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
