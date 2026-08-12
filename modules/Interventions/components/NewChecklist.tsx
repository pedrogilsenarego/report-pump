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
import useNewChecklist, { FORM_KINDS } from "./useNewChecklist";

export default function NewChecklist() {
  const {
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
  } = useNewChecklist();

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

            {/* Report Nr. is assigned server-side on save, so two admins submitting at
                the same moment cannot claim the same code. */}
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm font-medium">
                {i18n.t("newChecklist.reportNrLabel")}
              </span>
              <span className="text-sm text-muted-foreground">
                {i18n.t("newChecklist.reportNrAuto")}
              </span>
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

            {/* Action#04 — the four DATA-INPUT workbooks. All are required: the tree is
                built from all of them, and Form4 references actions defined in Form3. */}
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">
                {i18n.t("newChecklist.importFilesTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {i18n.t("newChecklist.importFilesHint")}
              </p>

              {FORM_KINDS.map((kind) => (
                <div key={kind} className="flex items-center gap-2">
                  <label className="w-40 shrink-0 text-xs">
                    {i18n.t(`newChecklist.formLabel.${kind}`)}
                  </label>
                  <Input
                    type="file"
                    accept=".xlsx"
                    className="text-xs"
                    onChange={(event) =>
                      setFile(kind, event.target.files?.[0] ?? undefined)
                    }
                  />
                  {files[kind] && <span className="text-xs">✓</span>}
                </div>
              ))}

              {/* The Forms ship two CHECK-LIST templates and the spec never says how one is
                  chosen (open question #7), so the admin picks. Options appear once a first
                  import attempt has reported what the files contain. */}
              {templates.length > 1 && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="w-40 shrink-0 text-xs">
                    {i18n.t("newChecklist.templateLabel")}
                  </label>
                  <select
                    value={template}
                    onChange={(event) => chooseTemplate(event.target.value)}
                    className="h-9 rounded-md border bg-transparent px-2 text-xs"
                  >
                    <option value="">
                      {i18n.t("newChecklist.templatePlaceholder")}
                    </option>
                    {templates.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* SF#082 / SF#084. The spec shows only an " X " marker with no detail; the
                issue list below it is ours — the admin cannot fix a file they cannot see
                the problem in. Open question #5 never got answered. */}
            {importStatus && (
              <div className="space-y-1">
                <p
                  className={
                    importStatus === "noErrors"
                      ? "text-sm text-muted-foreground"
                      : "text-sm text-destructive"
                  }
                >
                  {importStatus === "noErrors"
                    ? i18n.t("newChecklist.importNoErrors")
                    : i18n.t("newChecklist.importErrorsFound")}
                </p>

                {importStatus === "noErrors" && importCounts && (
                  <p className="text-xs text-muted-foreground">
                    {i18n.t("newChecklist.importCounts", importCounts)}
                  </p>
                )}

                {importIssues.length > 0 && (
                  <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
                    {importIssues.slice(0, 20).map((issue, index) => (
                      <li key={index}>
                        {issue.file}
                        {issue.row ? `:${issue.row}` : ""} — {issue.message}
                      </li>
                    ))}
                    {importIssues.length > 20 && (
                      <li>
                        {i18n.t("newChecklist.importMoreIssues", {
                          count: importIssues.length - 20,
                        })}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                {i18n.t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onImport}
                disabled={!filesReady || isImporting}
                isLoading={isImporting}
              >
                {i18n.t("newChecklist.import")}
              </Button>
              {/* SF#088 is activated only on a successful import, so the import is
                  mandatory — a check-list can never be created with an empty tree. */}
              <Button isLoading={isPending} type="submit" disabled={!canSubmit}>
                {i18n.t("common.ok")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
