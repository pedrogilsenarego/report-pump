"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInstallations } from "@/hook/useInstallation";
import { setInstallationCondition } from "@/actions/clientActions/installation.actions";
import {
  INSTALLATION_CONDITIONS,
  installationConditionLabel,
} from "@/constants/condition";
import { Installation } from "@/types/installation.types";
import { i18n } from "@/translations/i18n";

/** PopUp#28 — *Change Condition*: Active `1` / Exist but not Active `2` / Deleted `3`. */
export default function ChangeInstallationCondition({
  installation,
}: {
  installation: Installation;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(installation.condition ?? "");
  const { refetch } = useInstallations();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      setInstallationCondition({ id: installation.id, condition: value }),
    onError: (error: string) => {
      toast({
        variant: "destructive",
        title: i18n.t("condition.error"),
        description: error,
      });
    },
    onSuccess: () => {
      toast({ title: i18n.t("condition.changed") });
      setOpen(false);
      refetch();
    },
  });

  function onOpenChange(next: boolean) {
    if (next) setValue(installation.condition ?? "");
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {i18n.t("condition.change")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{i18n.t("condition.changeTitle")}</DialogTitle>
          <DialogDescription>
            {installation.name} — {i18n.t("condition.changeDescription")}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={value} onValueChange={setValue}>
          {INSTALLATION_CONDITIONS.map((code) => (
            <div key={code} className="flex items-center gap-2">
              <RadioGroupItem value={code} id={`cond-${installation.id}-${code}`} />
              <Label htmlFor={`cond-${installation.id}-${code}`}>
                {code} — {installationConditionLabel(code)}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {i18n.t("common.cancel")}
          </Button>
          <Button
            isLoading={isPending}
            disabled={
              !(INSTALLATION_CONDITIONS as readonly string[]).includes(value) ||
              value === installation.condition
            }
            onClick={() => mutate()}
          >
            {i18n.t("common.ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
