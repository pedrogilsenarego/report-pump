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
import { Form } from "@/components/ui/form";
import { Pump } from "@/types/pump.types";
import { i18n } from "@/translations/i18n";
import useNewPump from "./useNewPump";
import PumpGroupFields from "./PumpGroupFields";

/**
 * Screen#13 (new pump group) or, given `pump`, Screen#14 (edit). Both lay out the same six
 * blocks, so they share PumpGroupFields.
 */
export default function NewPump({ pump }: { pump?: Pump }) {
  const { form, onSubmit, isPending, openModal, onOpenChange } =
    useNewPump(pump);
  const isEdit = !!pump;

  return (
    <Dialog open={openModal} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            {i18n.t("pumpGroup.edit")}
          </Button>
        ) : (
          <Button variant="outline">{i18n.t("pumpGroup.new")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <DialogHeader>
              <DialogTitle>
                {i18n.t(isEdit ? "pumpGroup.editTitle" : "pumpGroup.newTitle")}
              </DialogTitle>
              <DialogDescription>
                {i18n.t("pumpGroup.description")}
              </DialogDescription>
            </DialogHeader>

            <PumpGroupFields form={form} />

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
