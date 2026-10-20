"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { QueryKeys } from "@/constants/queryKeys";
import { i18n } from "@/translations/i18n";

type Kind = "languages" | "periodicity";

type Result = {
  ok: boolean;
  errors: string[];
  summary?: { rows: number; removed: string[] };
};

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`referenceTables.${key}`, options);

/**
 * Screen#03 — SF#053 *Update Languages Table* (Action#22) and *Update Periodicity Table*
 * (Action#23). Two steps, like the check-list import: *Check* validates the workbook and
 * shows what would change without writing; only then is *OK* enabled, and it replaces the
 * table.
 */
export default function UpdateReferenceTable({ kind }: { kind: Kind }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [checked, setChecked] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async (dryRun: boolean): Promise<Result> => {
    const body = new FormData();
    body.append("kind", kind);
    body.append("file", file as File);
    if (dryRun) body.append("dryRun", "1");
    const response = await fetch("/api/admin/reference-tables", {
      method: "POST",
      body,
    });
    try {
      return (await response.json()) as Result;
    } catch {
      return { ok: false, errors: [t("requestFailed")] };
    }
  };

  async function onCheck() {
    if (!file) return;
    setBusy(true);
    setChecked(await send(true));
    setBusy(false);
  }

  async function onApply() {
    setBusy(true);
    const result = await send(false);
    setBusy(false);
    if (!result.ok) {
      setChecked(result);
      return;
    }
    toast({ title: t("updated") });
    queryClient.invalidateQueries({
      queryKey: [kind === "languages" ? QueryKeys.LANGUAGES : QueryKeys.PERIODICITY],
    });
    setOpen(false);
  }

  function onOpenChange(next: boolean) {
    if (next) {
      setFile(null);
      setChecked(null);
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{t(`${kind}.button`)}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t(`${kind}.button`)}</DialogTitle>
          <DialogDescription>{t(`${kind}.description`)}</DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setChecked(null);
          }}
        />

        {checked ? (
          checked.ok ? (
            <div className="text-sm">
              <p>{t("checkedRows", { count: checked.summary?.rows ?? 0 })}</p>
              {checked.summary?.removed.length ? (
                <p className="text-muted-foreground">
                  {t("willRemove", {
                    list: checked.summary.removed.join(", "),
                  })}
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="text-sm text-destructive list-disc pl-5 max-h-48 overflow-y-auto">
              {checked.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={!file || busy}
            isLoading={busy && !checked?.ok}
            onClick={onCheck}
          >
            {t("check")}
          </Button>
          <Button
            disabled={!checked?.ok || busy}
            isLoading={busy && !!checked?.ok}
            onClick={onApply}
          >
            {i18n.t("common.ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
