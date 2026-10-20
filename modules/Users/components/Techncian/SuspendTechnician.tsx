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
import { useToast } from "@/hooks/use-toast";
import { useTechnicians } from "@/hook/useTechnician";
import { setTechnicianCondition } from "@/actions/clientActions/technician.actions";
import {
  TECHNICIAN_SUSPENDED,
  isActiveTechnician,
} from "@/constants/condition";
import { Technician } from "@/types/technician.types";
import { i18n } from "@/translations/i18n";

/**
 * Screen#12 — the technician's record read-only, *Cancel* / *Suspend* -> Action#19
 * (`Condition = 2`). Reached from the row rather than PopUp#21's selector, which only
 * lists active technicians — the same as offering Suspend on active rows only.
 */
export default function SuspendTechnician({
  technician,
}: {
  technician: Technician;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { refetch } = useTechnicians();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      setTechnicianCondition({
        profileId: technician.id,
        condition: TECHNICIAN_SUSPENDED,
      }),
    onError: (error: string) => {
      toast({
        variant: "destructive",
        title: i18n.t("condition.error"),
        description: error,
      });
    },
    onSuccess: () => {
      toast({ title: i18n.t("condition.suspended_ok") });
      setOpen(false);
      refetch();
    },
  });

  if (!isActiveTechnician(technician.condition)) return null;

  const rows: [string, string | undefined][] = [
    [i18n.t("technicians.name"), technician.name],
    [i18n.t("technicians.function"), technician.function],
    [i18n.t("technicians.phone"), technician.phone],
    [i18n.t("technicians.email"), technician.email],
    [i18n.t("technicians.certification"), technician.certification],
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {i18n.t("condition.suspend")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{i18n.t("condition.suspendTitle")}</DialogTitle>
          <DialogDescription>
            {i18n.t("condition.suspendDescription")}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {i18n.t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            isLoading={isPending}
            onClick={() => mutate()}
          >
            {i18n.t("condition.suspend")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
