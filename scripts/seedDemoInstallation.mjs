/**
 * Seeds one installation + one pump group for a company, so an ADMIN account can exercise
 * the intervention flow.
 *
 *   node --env-file=.env.local scripts/seedDemoInstallation.mjs <companyId>
 *
 * Why a script and not the UI: installations, pump groups and technicians all belong to the
 * Customer menu (Screen#09) in the spec, and the app gates them to roles 2/3 accordingly.
 * An admin has no screen that creates them — New Installation also requires a Responsible
 * (role 6/7) that an admin's company will not have. This inserts the rows directly instead.
 *
 * Idempotent: re-running finds the existing demo rows instead of duplicating them.
 * `responsible_id` is left NULL — it is only required by the form's zod schema, not the DB.
 *
 * TEST DATA. Delete with:
 *   delete from pumps where installation_id in
 *     (select id from installations where name = 'Demo — Pump House');
 *   delete from installations where name = 'Demo — Pump House';
 */

import { createClient } from "@supabase/supabase-js";

const companyId = process.argv[2];
if (!companyId) {
  console.error("usage: node --env-file=.env.local scripts/seedDemoInstallation.mjs <companyId>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const INSTALLATION_NAME = "Demo — Pump House";

const { data: company } = await supabase
  .from("companies")
  .select("id, name")
  .eq("id", companyId)
  .maybeSingle();

console.log(`company: ${company?.name ?? "(no companies row)"} ${companyId}`);

let { data: installation } = await supabase
  .from("installations")
  .select("id, name")
  .eq("company_id", companyId)
  .eq("name", INSTALLATION_NAME)
  .maybeSingle();

if (installation) {
  console.log(`installation: reusing ${installation.id}`);
} else {
  const { data, error } = await supabase
    .from("installations")
    .insert({
      name: INSTALLATION_NAME,
      area: "Demo area",
      address: "Rua de Teste 1, Carcavelos",
      // INSTALLATION.Condition pre-set values (drawing p3): 1 Active / 2 Exist but not
      // active / 3 Deleted. Stored as text elsewhere in this table, so keep it a string.
      condition: "1",
      company_id: companyId,
      // Must be an EXPLICIT null. The column has a non-null DEFAULT pointing at a
      // responsables row that no longer exists, so omitting it trips
      // installations_responsible_id_fkey. Only the form's zod schema requires a value.
      responsible_id: null,
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("failed to create installation:", error.message);
    process.exit(1);
  }
  installation = data;
  console.log(`installation: created ${installation.id}`);
}

const { data: existingPump } = await supabase
  .from("pumps")
  .select("id, type")
  .eq("installation_id", installation.id)
  .maybeSingle();

if (existingPump) {
  console.log(`pump group: reusing ${existingPump.id} (type ${existingPump.type})`);
} else {
  // PUMP_GROUP.Type pre-set values (p3): J Jockey (+ Pump Room) / E Electric / D Diesel.
  // `pumps.type` is still free text (backlog item 3), so this is just the right letter.
  const { data, error } = await supabase
    .from("pumps")
    .insert({ installation_id: installation.id, type: "E", condition: "1" })
    .select("id, type")
    .single();

  if (error) {
    console.error("failed to create pump group:", error.message);
    process.exit(1);
  }
  console.log(`pump group: created ${data.id} (type ${data.type})`);
}

console.log("\nDone. Interventions > New Intervention should now offer this installation.");
