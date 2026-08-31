/**
 * Read-only readiness check for the intervention lifecycle (docs/intervention-lifecycle.md).
 *
 * Answers "why does the New Intervention screen show nothing / fail to save?" by looking at
 * the three things it depends on: the migration, a check-list with imported actions, and an
 * installation with a pump group.
 *
 *   node --env-file=.env.local scripts/interventionReadiness.mjs
 *
 * Writes nothing. Uses the service-role key, so it bypasses RLS — it reports what EXISTS,
 * not what a given signed-in user can see.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const NEW_TABLES = [
  "int_result",
  "int_notes",
  "measurements",
  "intervention_technicians",
  "ctrl_status",
];

const line = (ok, text) => console.log(`${ok ? "  ok " : "  -- "} ${text}`);

/**
 * NOTE: this must NOT use `{ head: true }`. A HEAD request carries no response body, so
 * supabase-js has no JSON error to parse and hands back `error: null` even for a table that
 * does not exist — which reads as "table present". Use a real GET.
 */
const tableExists = async (table) => {
  const { error } = await supabase.from(table).select("*").limit(1);
  // PGRST205 / 42P01 both mean "no such table".
  if (error && /does not exist|Could not find the table|PGRST205/i.test(error.message)) {
    return false;
  }
  if (error) throw new Error(`${table}: ${error.message}`);
  return true;
};

const count = async (table) => {
  const { count: n, error } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .limit(1);
  if (error) return null;
  return n ?? 0;
};

console.log("\n1. Migration 20260831_intervention_lifecycle.sql");
let migrated = true;
for (const table of NEW_TABLES) {
  const exists = await tableExists(table);
  if (!exists) migrated = false;
  line(exists, table);
}

// `locked` is the column the print gate reads; its absence means the ALTER did not run.
const { error: lockedError } = await supabase
  .from("interventions")
  .select("locked, pump_id, ref_month, controler_status")
  .limit(1);
const columnsAdded = !lockedError;
line(columnsAdded, "interventions.locked / pump_id / ref_month / controler_status");
if (lockedError) migrated = false;

console.log("\n2. A check-list with imported actions (Action#04)");
const { data: checklists } = await supabase
  .from("checklists")
  .select("id, code, name")
  .order("id", { ascending: false });

if (!checklists?.length) {
  line(false, "no check-lists at all — create one from Checklists > New Checklist");
} else {
  for (const checklist of checklists) {
    const { count: actions } = await supabase
      .from("cl_action")
      .select("*", { head: true, count: "exact" })
      .eq("checklist_id", checklist.id);
    const { count: values } = await supabase
      .from("cl_action_values")
      .select("*", { head: true, count: "exact" })
      .in(
        "cl_action_id",
        (
          await supabase
            .from("cl_action")
            .select("id")
            .eq("checklist_id", checklist.id)
        ).data?.map((row) => row.id) ?? [-1]
      );
    line(
      (actions ?? 0) > 0,
      `check-list ${checklist.id} (Report Nr. ${checklist.code ?? "—"}, ${
        checklist.name ?? "unnamed"
      }): ${actions ?? 0} actions, ${values ?? 0} measurement slots`
    );
  }
}

console.log("\n3. An installation with a pump group");
const { data: installations } = await supabase
  .from("installations")
  .select("id, name");

if (!installations?.length) {
  line(false, "no installations");
} else {
  for (const installation of installations) {
    const { count: pumps } = await supabase
      .from("pumps")
      .select("*", { head: true, count: "exact" })
      .eq("installation_id", installation.id);
    line(
      (pumps ?? 0) > 0,
      `${installation.name ?? installation.id}: ${pumps ?? 0} pump group(s)`
    );
  }
}

console.log("\n4. Existing interventions");
console.log(`   interventions: ${await count("interventions")}`);
if (migrated) {
  console.log(`   int_result:    ${await count("int_result")}`);
  console.log(`   measurements:  ${await count("measurements")}`);
}

console.log(
  `\nVerdict: ${
    migrated
      ? "migration applied."
      : "MIGRATION NOT APPLIED — run supabase/migrations/20260831_intervention_lifecycle.sql in the SQL editor."
  }\n`
);
