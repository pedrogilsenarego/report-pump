/**
 * The two emails sheet 5/6 sends when a report is finalised and locked.
 *
 * From the drawing, on "Save and lock Report? -> OK":
 *
 *   SET table.INTERVENTION.Locked = 2
 *   Send email to ADMIN with: Customer.ID / Installation.ID / PumpGroup.ID / Intervention.ID
 *     List all table.CL_ACTION:Code where table.INT_RESULT:Result = 'X' or '*'
 *   SEND email WITH ALL RECORDS FROM table.INT_NOTES
 *     From current table.INTERVENTION to Administrator                          [Rev1]
 *
 * Two emails, both to the administrator: a failures summary and the notes.
 *
 * NOTE ON THE BODY TEXT. `#Emails.xlsx` carries only TO and SUBJECT for its two templates,
 * and its CONTENTS cell is a literal `....` — the client has never written the bodies, and
 * neither of these two emails is in that file at all. The text below is therefore ours: it
 * states the four IDs and the failed action codes the drawing names, and nothing more.
 * Replace it when the client supplies the real copy (docs/TODO.md item 5).
 *
 * POST { interventionId }. Runs after the client has locked the report; a failure here is
 * reported but does NOT unlock it — the lock is the user's decision and the record of it is
 * already committed.
 */

import { NextRequest, NextResponse } from "next/server";

import { mailOptions, transporter } from "@/config/nodemailer";
import { supabaseServer } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "ADMIN@FP25.com";

/** Result codes that count as a failure — sheet 5/6: `Result = 'X' or '*'`. */
const FAILED = ["X", "*"];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: NextRequest) {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  let interventionId: number | undefined;
  try {
    const body = await request.json();
    interventionId = Number(body?.interventionId);
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  if (!interventionId || !Number.isFinite(interventionId)) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  // RLS scopes this read, so a user cannot mail themselves someone else's report.
  const { data: intervention, error } = await supabase
    .from("interventions")
    .select("id, code, checklist_id, installation_id, pump_id, ref_month, locked")
    .eq("id", interventionId)
    .single();

  if (error || !intervention) {
    return NextResponse.json(
      { message: error?.message || "Intervention not found" },
      { status: 404 }
    );
  }

  const [results, notes, installation] = await Promise.all([
    supabase
      .from("int_result")
      .select("code_gr, code_sub_gr, code_action, result")
      .eq("intervention_id", interventionId),
    supabase
      .from("int_notes")
      .select("text")
      .eq("intervention_id", interventionId),
    supabase
      .from("installations")
      .select("id, name, company_id")
      .eq("id", intervention.installation_id)
      .maybeSingle(),
  ]);

  const failedCodes = (results.data || [])
    .filter((row) => FAILED.includes(row.result))
    .map((row) => `${row.code_gr}.${row.code_sub_gr}.${row.code_action}`)
    .sort();

  const ids = [
    `Customer.ID: ${installation.data?.company_id ?? "—"}`,
    `Installation.ID: ${intervention.installation_id ?? "—"}`,
    `PumpGroup.ID: ${intervention.pump_id ?? "—"}`,
    `Intervention.ID: ${intervention.code ?? intervention.id}`,
  ];

  const refMonth = intervention.ref_month ? ` (${intervention.ref_month})` : "";

  const failuresText = [
    `FIREPUMP25 — report finalised${refMonth}`,
    "",
    ...ids,
    "",
    failedCodes.length
      ? `Failed actions (CL_ACTION code):\n${failedCodes.join("\n")}`
      : "No failed actions were recorded.",
  ].join("\n");

  const noteLines = (notes.data || []).map((row) => row.text).filter(Boolean);

  const notesText = [
    `FIREPUMP25 — notes from finalised report${refMonth}`,
    "",
    ...ids,
    "",
    noteLines.length ? noteLines.join("\n\n") : "No notes were recorded.",
  ].join("\n");

  const asHtml = (text: string) =>
    `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(
      text
    )}</pre>`;

  try {
    // Sent sequentially so a failure on the first does not leave the second half-sent
    // without us knowing which one broke.
    await transporter.sendMail({
      ...mailOptions,
      to: ADMIN_EMAIL,
      subject: `FIREPUMP25 - Report finalised - Intervention ${
        intervention.code ?? intervention.id
      }`,
      text: failuresText,
      html: asHtml(failuresText),
    });

    await transporter.sendMail({
      ...mailOptions,
      to: ADMIN_EMAIL,
      subject: `FIREPUMP25 - Report notes - Intervention ${
        intervention.code ?? intervention.id
      }`,
      text: notesText,
      html: asHtml(notesText),
    });

    return NextResponse.json({ success: true, failedCodes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    console.error("Error sending finalise emails:", err);
    return NextResponse.json({ message }, { status: 502 });
  }
}
