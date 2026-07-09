"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { i18n } from "@/translations/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user confirms (OK) the access conditions. */
  onAccept: () => void;
};

/**
 * Modal that displays the general access conditions. Mirrors the mockup:
 * the conditions text is shown in a scrollable box with Cancel / OK actions.
 */
export default function AccessConditions({
  open,
  onOpenChange,
  onAccept,
}: Props) {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{i18n.t("signup.accessConditionsTitle")}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto rounded-md border p-4 text-sm text-muted-foreground">
          {i18n.t("signup.accessConditionsBody")}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {i18n.t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleAccept}>
            {i18n.t("common.ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
