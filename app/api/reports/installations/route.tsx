/**
 * Action#30 — generate REPORT#10 (list of installations), Screen#09 -> INSTALLATIONS ->
 * *List installations (pdf)*.
 *
 * GET -> application/pdf. Action#31 saves it via PopUp#41/#42; in a browser that is the
 * download itself, as with REPORT#01 and #02.
 *
 * Scope is the caller's own company (`INSTALLATION:Code_Customer = CUSTOMER:Code`). RLS
 * still decides what the session may read.
 */

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { supabaseServer } from "@/lib/supabase/server";
import {
  InstallationRow,
  Report10Installations,
} from "@/lib/reports/Report10Installations";
import { specDate } from "@/lib/reports/reportFurniture";

type Row = {
  name: string | null;
  area: string | null;
  address: string | null;
  condition: string | null;
  profiles: { display_name: string | null } | null;
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
    .from("installations")
    .select("name, area, address, condition, profiles ( display_name )")
    .eq("company_id", profile.company_id)
    .order("name", { ascending: true });

  if (error) {
    console.error("REPORT#10 query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const installations: InstallationRow[] = ((data || []) as unknown as Row[]).map(
    (row) => ({
      name: row.name,
      area: row.area,
      address: row.address,
      responsible: row.profiles?.display_name,
      condition: row.condition,
    })
  );

  const date = specDate();
  const buffer = await renderToBuffer(
    <Report10Installations
      customerName={company?.company_name || ""}
      installations={installations}
      date={date}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="REPORT10-installations-${date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
