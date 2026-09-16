/**
 * Action#20 — generate REPORT#01 (list of technicians), `SF#244` on Screen#09.
 *
 * GET -> application/pdf. The spec's Action#21 then saves it to `[Input xLocation]` via
 * PopUp#22; in a browser that is the download itself, so there is no second call.
 *
 * Rendered server-side for the same reasons as the check-list import: the renderer stays
 * off the client bundle, and the query runs under the caller's session so RLS decides what
 * they may read rather than this route.
 *
 * Scope is the caller's own company. The spec's loop is
 * `TECHNICIAN_CUST with .code = CUSTOMER:Code` (itself a slip for `Code_Customer`), and in
 * this codebase a technician is a `profiles` row with role 4/5 carrying `company_id`.
 * Suspended technicians are INCLUDED — see the note in Report01Technicians.tsx.
 */

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { KeyRoles } from "@/constants/roles";
import { supabaseServer } from "@/lib/supabase/server";
import {
  Report01Technicians,
  TechnicianRow,
} from "@/lib/reports/Report01Technicians";
import { specDate } from "@/lib/reports/reportFurniture";

type ProfileRow = {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  default_language: string | null;
  technician: { function: string | null; certification: string | null; condition: string | null }[] | null;
};

export async function GET() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json(
      { error: "This account has no company." },
      { status: 403 }
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select("company_name")
    .eq("id", profile.company_id)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        display_name,
        email,
        phone,
        default_language,
        technician ( function, certification, condition )
      `
    )
    .eq("company_id", profile.company_id)
    .in("role", [KeyRoles.CUSTOMER_TECHNICIAN, KeyRoles.SUPPLYER_TECHNICIAN])
    .order("display_name", { ascending: true });

  if (error) {
    console.error("REPORT#01 query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The detail row is a 1-1 join modelled as an array by PostgREST, and it can be absent:
  // a profile with role 4 predating the `technician` table has no detail row at all.
  const technicians: TechnicianRow[] = ((data || []) as ProfileRow[]).map((row) => ({
    name: row.display_name,
    function: row.technician?.[0]?.function,
    phone: row.phone,
    email: row.email,
    language: row.default_language,
    certification: row.technician?.[0]?.certification,
    condition: row.technician?.[0]?.condition,
  }));

  const date = specDate();
  const buffer = await renderToBuffer(
    <Report01Technicians
      customerName={company?.company_name || ""}
      technicians={technicians}
      date={date}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // The spec saves to a location the user picks; a download is the browser's version
      // of that, so this is an attachment rather than an inline preview.
      "Content-Disposition": `attachment; filename="REPORT01-technicians-${date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
