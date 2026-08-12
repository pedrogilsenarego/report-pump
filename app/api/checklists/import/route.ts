/**
 * Action#04 — Groups / Sub-Gr Import (SF#081 on PopUp#07).
 *
 * POST multipart/form-data:
 *   form1..form4   the four DATA-INPUT workbooks (required)
 *   template       which CHECK-LIST column to import; omit to discover the options
 *   dryRun         "1" to validate only and write nothing
 *   name, date, nfpaEd, companyResp, nameResp, phone, email   the PopUp#07 header
 *
 * Two-phase on purpose, matching the spec: SF#081 validates (dryRun) and only on success is
 * SF#088 (OK) activated; OK then posts again for real. Validation is entirely in memory, so
 * a failed import writes nothing at all.
 *
 * Parsing runs server-side so the atomic insert and the single ok/error verdict live in one
 * place, and the ~800KB spreadsheet reader stays off the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  FormKind,
  ImportIssue,
  ParsedChecklist,
  parseChecklistForms,
} from "@/lib/forms/parseChecklistForms";
import { KeyRoles } from "@/constants/roles";
import { insertChecklistTree } from "@/lib/forms/insertChecklistTree";

const FORM_KINDS: FormKind[] = ["form1", "form2", "form3", "form4"];

type ImportResponse = {
  ok: boolean;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  templates: number[];
  counts?: { groups: number; subgroups: number; actions: number; values: number };
  checklistId?: number;
};

const fail = (errors: ImportIssue[], status = 400, extra: Partial<ImportResponse> = {}) =>
  NextResponse.json<ImportResponse>(
    { ok: false, errors, warnings: [], templates: [], ...extra },
    { status }
  );

export async function POST(request: NextRequest) {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail([{ file: "cross", message: "Not authenticated." }], 401);
  }

  // The spec puts PopUp#07 behind the Administrator menu (Screen#03), so this is
  // admin-only. RLS on the cl_* tables enforces it again via is_admin(); this check just
  // turns that into a clear 403 instead of an opaque insert failure.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== KeyRoles.ADMIN) {
    return fail(
      [{ file: "cross", message: "Only an administrator can import a check-list." }],
      403
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail([{ file: "cross", message: "Expected a multipart/form-data body." }]);
  }

  // -- Files ------------------------------------------------------------------
  const buffers: Partial<Record<FormKind, ArrayBuffer>> = {};
  const missing: FormKind[] = [];

  for (const kind of FORM_KINDS) {
    const entry = formData.get(kind);
    if (!entry || typeof entry === "string") {
      missing.push(kind);
      continue;
    }
    buffers[kind] = await entry.arrayBuffer();
  }

  if (missing.length) {
    return fail(
      missing.map((kind) => ({ file: kind, message: "File not supplied." }))
    );
  }

  // -- Parse and validate -----------------------------------------------------
  const templateRaw = formData.get("template");
  const template =
    typeof templateRaw === "string" && templateRaw.trim()
      ? Number.parseInt(templateRaw, 10)
      : undefined;

  const parsed = parseChecklistForms(
    buffers as Record<FormKind, ArrayBuffer>,
    template === undefined || Number.isNaN(template) ? {} : { template }
  );

  const counts = parsed.data ? countTree(parsed.data) : undefined;

  if (!parsed.ok || !parsed.data) {
    return NextResponse.json<ImportResponse>(
      {
        ok: false,
        errors: parsed.errors,
        warnings: parsed.warnings,
        templates: parsed.templates,
      },
      { status: 200 } // A rejected file is a normal outcome, not an HTTP error.
    );
  }

  const dryRun = formData.get("dryRun") === "1";
  if (dryRun) {
    return NextResponse.json<ImportResponse>({
      ok: true,
      errors: [],
      warnings: parsed.warnings,
      templates: parsed.templates,
      counts,
    });
  }

  // -- Write ------------------------------------------------------------------
  const text = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  // Report Nr. is assigned here, not on the client: two admins submitting at once would
  // otherwise compute the same next code.
  const { data: highest } = await supabase
    .from("checklists")
    .select("code")
    .order("code", { ascending: false })
    .limit(1)
    .single();

  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      code: (highest?.code || 0) + 1,
      name: text("name"),
      date: text("date"),
      nfpa_ed: text("nfpaEd"),
      company_resp: text("companyResp"),
      name_resp: text("nameResp"),
      ph: text("phone"),
      email: text("email"),
    })
    .select("id")
    .single();

  if (checklistError || !checklist) {
    return fail(
      [
        {
          file: "cross",
          message: `Could not create the check-list: ${checklistError?.message}`,
        },
      ],
      500,
      { templates: parsed.templates }
    );
  }

  try {
    await insertChecklistTree(supabase, checklist.id, parsed.data);
  } catch (error) {
    // Compensating delete: cl_gr cascades from checklists, and every child cascades from
    // cl_gr, so removing the header removes any partially-written tree with it. PostgREST
    // cannot span statements in one transaction, so this is how the all-or-nothing
    // guarantee is kept.
    await supabase.from("checklists").delete().eq("id", checklist.id);

    return fail(
      [
        {
          file: "cross",
          message: `Import failed and was rolled back: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      500,
      { templates: parsed.templates }
    );
  }

  return NextResponse.json<ImportResponse>({
    ok: true,
    errors: [],
    warnings: parsed.warnings,
    templates: parsed.templates,
    counts,
    checklistId: checklist.id,
  });
}

// ---------------------------------------------------------------------------

const countTree = (tree: ParsedChecklist) => {
  const subgroups = tree.groups.flatMap((group) => group.subGroups);
  const actions = subgroups.flatMap((subgroup) => subgroup.actions);

  return {
    groups: tree.groups.length,
    subgroups: subgroups.length,
    actions: actions.length,
    values: actions.reduce((total, action) => total + action.values.length, 0),
  };
};
