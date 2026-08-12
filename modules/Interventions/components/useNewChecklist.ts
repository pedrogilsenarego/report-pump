"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { NewChecklistType, NewCheklistSchema } from "./NewChecklist.validation";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useChecklists } from "@/hook/useChecklist";
import { FormKind, ImportIssue } from "@/lib/forms/parseChecklistForms";
import { i18n } from "@/translations/i18n";

const DEFAULT_NFPA_ED = "NFPA-25 Last Edition";

const currentDate = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${now.getFullYear()}.${month}.${day}`;
};

// Action#04 outcome: null = not run yet, then No errors / Errors found (SF#082 / SF#084).
export type ImportStatus = "noErrors" | "errorsFound" | null;

export type ImportCounts = {
  groups: number;
  subgroups: number;
  actions: number;
  values: number;
};

export const FORM_KINDS: FormKind[] = ["form1", "form2", "form3", "form4"];

type ImportResponse = {
  ok: boolean;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  templates: number[];
  counts?: ImportCounts;
  checklistId?: number;
};

export default function useNewChecklist() {
  const { toast } = useToast();
  const checklists = useChecklists();
  const [openModal, setOpenModal] = useState(false);

  const [files, setFiles] = useState<Partial<Record<FormKind, File>>>({});
  const [template, setTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<number[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);
  const [importIssues, setImportIssues] = useState<ImportIssue[]>([]);
  const [importCounts, setImportCounts] = useState<ImportCounts | null>(null);

  const filesReady = FORM_KINDS.every((kind) => !!files[kind]);

  // The import is mandatory: SF#088 (OK) is only activated once Action#04 succeeds.
  const canSubmit = importStatus === "noErrors";

  const form = useForm<NewChecklistType>({
    resolver: zodResolver(NewCheklistSchema),
    defaultValues: {
      date: currentDate(),
      name: "",
      nfpaEd: DEFAULT_NFPA_ED,
      companyResp: "",
      nameResp: "",
      phone: "",
      email: "",
    },
  });

  const reset = () => {
    form.reset();
    setFiles({});
    setTemplate("");
    setTemplates([]);
    setImportStatus(null);
    setImportIssues([]);
    setImportCounts(null);
  };

  const buildBody = (dryRun: boolean) => {
    const body = new FormData();

    FORM_KINDS.forEach((kind) => {
      const file = files[kind];
      if (file) body.append(kind, file);
    });

    if (template) body.append("template", template);
    if (dryRun) body.append("dryRun", "1");

    if (!dryRun) {
      const values = form.getValues();
      body.append("name", values.name || "");
      body.append("date", values.date || "");
      body.append("nfpaEd", values.nfpaEd || "");
      body.append("companyResp", values.companyResp || "");
      body.append("nameResp", values.nameResp || "");
      body.append("phone", values.phone || "");
      body.append("email", values.email || "");
    }

    return body;
  };

  const post = async (dryRun: boolean): Promise<ImportResponse> => {
    const response = await fetch("/api/checklists/import", {
      method: "POST",
      body: buildBody(dryRun),
    });

    return (await response.json()) as ImportResponse;
  };

  const applyResult = (result: ImportResponse) => {
    setTemplates(result.templates || []);
    setImportIssues(result.ok ? result.warnings || [] : result.errors || []);
    setImportCounts(result.counts || null);
    setImportStatus(result.ok ? "noErrors" : "errorsFound");

    // When the files carry more than one template and none was chosen, the parser reports
    // it as an error and returns the options — surface them so the admin can pick.
    if (!result.ok && !template && result.templates?.length > 1) {
      setTemplate("");
    }
  };

  // Action#04 — SF#081. Validates only; nothing is written until OK.
  const { mutate: runImport, isPending: isImporting } = useMutation({
    mutationFn: () => post(true),
    onSuccess: applyResult,
    onError: () => {
      setImportStatus("errorsFound");
      setImportIssues([
        { file: "cross", message: i18n.t("newChecklist.importRequestFailed") },
      ]);
    },
  });

  // SF#088 — creates the CHECK_LIST row and the whole tree, or nothing at all.
  const { mutate: submitChecklist, isPending } = useMutation({
    mutationFn: () => post(false),
    onSuccess: (result) => {
      if (!result.ok) {
        applyResult(result);
        return;
      }

      checklists.refetch();
      setOpenModal(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: i18n.t("newChecklist.importFailedTitle"),
        description: error.message,
      });
    },
  });

  const setFile = (kind: FormKind, file?: File) => {
    setFiles((current) => ({ ...current, [kind]: file }));
    // Any change to the inputs invalidates the previous verdict, so OK locks again.
    setImportStatus(null);
    setImportIssues([]);
    setImportCounts(null);
  };

  const chooseTemplate = (value: string) => {
    setTemplate(value);
    setImportStatus(null);
    setImportIssues([]);
    setImportCounts(null);
  };

  function onImport() {
    if (!filesReady) return;
    runImport();
  }

  function onSubmit() {
    if (!canSubmit) return;
    submitChecklist();
  }

  return {
    form,
    onSubmit,
    onImport,
    files,
    setFile,
    filesReady,
    template,
    templates,
    chooseTemplate,
    importStatus,
    importIssues,
    importCounts,
    isImporting,
    canSubmit,
    openModal,
    setOpenModal,
    isPending,
  };
}
