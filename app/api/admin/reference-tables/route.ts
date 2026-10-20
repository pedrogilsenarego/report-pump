/**
 * Action#22 (Update Languages Table) / Action#23 (Update Periodicity Table) — Screen#03.
 *
 * POST multipart/form-data:
 *   kind     "languages" | "periodicity"
 *   file     the workbook (Table_Language.xlsx / Table_Peridiocity.xlsx)
 *   dryRun   "1" to validate only and write nothing
 *
 * The uploaded workbook REPLACES the table: rows in the file are upserted, rows not in it
 * are deleted. Two guards make that safe:
 *
 *  * Any parse error rejects the whole file — nothing is written.
 *  * A code may only disappear if nothing uses it. A periodicity code still held by some
 *    `cl_action.period`, or a language still used by imported check-list text, blocks the
 *    upload; otherwise those rows would lose their label silently.
 *
 * Admin-only; RLS enforces it again through is_admin().
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { KeyRoles } from "@/constants/roles";
import {
  parseLanguages,
  parsePeriodicity,
} from "@/lib/forms/parseReferenceTables";

type Kind = "languages" | "periodicity";

type Response = {
  ok: boolean;
  errors: string[];
  /** What the upload would do / did. */
  summary?: { rows: number; removed: string[] };
};

const fail = (errors: string[], status = 400) =>
  NextResponse.json<Response>({ ok: false, errors }, { status });

/** The check-list text tables that store a language code per row. */
const TEXT_TABLES = ["cl_gr_text", "cl_subgr_text", "cl_action_text", "cl_values_text"];

export async function POST(request: NextRequest) {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(["Not authenticated."], 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== KeyRoles.ADMIN) {
    return fail(["Only an administrator can update reference tables."], 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(["Expected a multipart/form-data body."]);
  }

  const kind = form.get("kind") as Kind | null;
  const file = form.get("file");
  const dryRun = form.get("dryRun") === "1";

  if (kind !== "languages" && kind !== "periodicity") {
    return fail(['"kind" must be "languages" or "periodicity".']);
  }
  if (!(file instanceof Blob) || !file.size) {
    return fail(["No workbook was uploaded."]);
  }

  const buffer = await file.arrayBuffer();

  if (kind === "languages") {
    const { rows, errors } = parseLanguages(buffer);
    if (errors.length) return fail(errors);

    const { data: existing, error } = await supabase.from("languages").select("code");
    if (error) return fail([error.message], 500);

    const incoming = new Set(rows.map((row) => row.code));
    const removed = (existing || [])
      .map((row) => row.code as string)
      .filter((code) => !incoming.has(code));

    const inUse: string[] = [];
    for (const code of removed) {
      for (const table of TEXT_TABLES) {
        const { data } = await supabase
          .from(table)
          .select("language")
          .eq("language", code)
          .limit(1);
        if (data?.length) {
          inUse.push(`${code} cannot be removed — check-list text uses it (${table}).`);
          break;
        }
      }
    }
    if (inUse.length) return fail(inUse);

    if (!dryRun) {
      const { error: upsertError } = await supabase.from("languages").upsert(rows);
      if (upsertError) return fail([upsertError.message], 500);
      if (removed.length) {
        const { error: deleteError } = await supabase
          .from("languages")
          .delete()
          .in("code", removed);
        if (deleteError) return fail([deleteError.message], 500);
      }
    }

    return NextResponse.json<Response>({
      ok: true,
      errors: [],
      summary: { rows: rows.length, removed },
    });
  }

  // periodicity
  const { rows, errors } = parsePeriodicity(buffer);
  if (errors.length) return fail(errors);

  const { data: existing, error } = await supabase
    .from("periodicity")
    .select("code, language");
  if (error) return fail([error.message], 500);

  const incoming = new Set(rows.map((row) => `${row.code}:${row.language}`));
  const incomingCodes = new Set(rows.map((row) => row.code));
  const removedRows = (existing || []).filter(
    (row) => !incoming.has(`${row.code}:${row.language}`)
  );

  // A code disappears only if no language of it survives.
  const removedCodes = Array.from(
    new Set(removedRows.map((row) => Number(row.code)))
  ).filter((code) => !incomingCodes.has(code));

  const inUse: string[] = [];
  for (const code of removedCodes) {
    const { data } = await supabase
      .from("cl_action")
      .select("id")
      .eq("period", code)
      .limit(1);
    if (data?.length) {
      inUse.push(`Period ${code} cannot be removed — check-list actions use it.`);
    }
  }
  if (inUse.length) return fail(inUse);

  if (!dryRun) {
    const { error: upsertError } = await supabase.from("periodicity").upsert(rows);
    if (upsertError) return fail([upsertError.message], 500);
    for (const row of removedRows) {
      const { error: deleteError } = await supabase
        .from("periodicity")
        .delete()
        .eq("code", row.code)
        .eq("language", row.language);
      if (deleteError) return fail([deleteError.message], 500);
    }
  }

  return NextResponse.json<Response>({
    ok: true,
    errors: [],
    summary: {
      rows: rows.length,
      removed: removedRows.map((row) => `${row.code} ${row.language}`),
    },
  });
}
