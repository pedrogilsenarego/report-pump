/**
 * Action#26 — generate REPORT#02 (list of pump groups by customer), Screen#09 -> PUMP
 * GROUPS -> *List of Groups (pdf)*.
 *
 * GET -> application/pdf. Action#27 saves it via PopUp#35; in a browser that is the
 * download itself, as with REPORT#01.
 *
 * Scope is the caller's own company: installations with `company_id` = the caller's, then
 * their pumps. `PUMP_GROUP:Code_Customer` has no column here — it is derived through
 * `installations.company_id`, which is what the spec's second condition reduces to.
 * RLS still decides what the session may read.
 */

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { supabaseServer } from "@/lib/supabase/server";
import { mapPumps } from "@/mappers/pump.mapper";
import {
  InstallationPumpGroups,
  Report02PumpGroups,
} from "@/lib/reports/Report02PumpGroups";
import { specDate } from "@/lib/reports/reportFurniture";
import { PumpRaw } from "@/types/pump.types";

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

  const { data: installations, error: installationsError } = await supabase
    .from("installations")
    .select("id, name")
    .eq("company_id", profile.company_id)
    .order("name", { ascending: true });

  if (installationsError) {
    console.error("REPORT#02 installations query failed:", installationsError);
    return NextResponse.json(
      { error: installationsError.message },
      { status: 500 }
    );
  }

  const installationIds = (installations || []).map((i) => i.id);

  let pumps: PumpRaw[] = [];
  if (installationIds.length) {
    const { data, error } = await supabase
      .from("pumps")
      .select("*")
      .in("installation_id", installationIds)
      .order("id", { ascending: true });

    if (error) {
      console.error("REPORT#02 pumps query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    pumps = (data || []) as PumpRaw[];
  }

  const groups = mapPumps(pumps);
  const byInstallation: InstallationPumpGroups[] = (installations || []).map(
    (installation) => ({
      installationName: installation.name || "",
      pumpGroups: groups.filter(
        (group) => String(group.installationId) === String(installation.id)
      ),
    })
  );

  const date = specDate();
  const buffer = await renderToBuffer(
    <Report02PumpGroups
      customerName={company?.company_name || ""}
      installations={byInstallation}
      date={date}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="REPORT02-pump-groups-${date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
