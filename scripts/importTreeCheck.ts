/**
 * Drives insertChecklistTree against the real database with the service-role key, then
 * reads the tree back and deletes the throwaway check-list. Proves the schema accepts the
 * shape the importer produces without needing a browser session.
 *
 *   npx tsx --env-file=.env.local scripts/importTreeCheck.ts
 */

import { createClient } from "@supabase/supabase-js";
import { insertChecklistTree } from "../lib/forms/insertChecklistTree";
import { ParsedChecklist } from "../lib/forms/parseChecklistForms";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Two groups, three sub-groups, three actions, two measurement slots — enough to exercise
// every table, both composite FKs, and the multi-language _text path.
const tree: ParsedChecklist = {
  template: 1,
  groups: [
    {
      code: 1,
      texts: [
        { language: "PTG", name: "Inspeções Pré-ensaio (IPE)" },
        { language: "ENG", name: "Pre-Test Inspections (PTI)" },
      ],
      subGroups: [
        {
          code: 1,
          texts: [
            { language: "PTG", name: "Sala de Bombas S.I." },
            { language: "ENG", name: "Pump House" },
          ],
          actions: [
            {
              code: 1,
              period: 2,
              texts: [
                {
                  language: "PTG",
                  name: "Verificação do estado de limpeza da sala",
                  type: "IPE",
                  source: "Instruções do Fabricante",
                },
                {
                  language: "ENG",
                  name: "Verification of room cleaness",
                  type: "PTI",
                  source: "Mnfct instructions",
                },
              ],
              values: [],
            },
            {
              code: 2,
              period: 1,
              texts: [
                { language: "PTG", name: "Temperatura ambiente", type: "IPE", source: "8.2.2(1)(a/b)" },
                { language: "ENG", name: "Ambient temperature", type: "PTI", source: "8.2.2(1)(a/b)" },
              ],
              values: [
                {
                  code: 1,
                  texts: [
                    { language: "PTG", name: "Valor (ºC):" },
                    { language: "ENG", name: "Value (ºC):" },
                  ],
                },
              ],
            },
          ],
        },
        // Same sub-group code under a different group — the case a global catalog broke on.
        { code: 2, texts: [{ language: "PTG", name: "Condição de Bombas S.I." }], actions: [] },
      ],
    },
    {
      code: 2,
      texts: [
        { language: "PTG", name: "Verificações e Ensaios (VE)" },
        { language: "ENG", name: "Verifications and Tests (VT)" },
      ],
      subGroups: [
        {
          code: 1,
          texts: [{ language: "PTG", name: "Bombas S.I." }, { language: "ENG", name: "Fire Fighting Pumps" }],
          actions: [
            {
              code: 1,
              period: 2,
              texts: [{ language: "PTG", name: "Pressão de arranque", type: "VE", source: "8.3.3.1" }],
              values: [
                { code: 1, texts: [{ language: "PTG", name: "Mais alta (bar):" }] },
                { code: 2, texts: [{ language: "PTG", name: "Mais baixa (bar):" }] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const main = async () => {
  const { data: highest } = await supabase
    .from("checklists")
    .select("code")
    .order("code", { ascending: false })
    .limit(1)
    .single();

  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert({
      code: (highest?.code || 0) + 1,
      name: "__import smoke test__",
      date: "2026.08.12",
      nfpa_ed: "NFPA-25 Last Edition",
    })
    .select("id, code")
    .single();

  if (error || !checklist) throw new Error(`checklists: ${error?.message}`);
  console.log(`created checklist id=${checklist.id} code=${checklist.code}`);

  try {
    await insertChecklistTree(supabase, checklist.id, tree);
    console.log("insertChecklistTree: ok");

    // Read back the way the app does, including the nested _text rows.
    const { data: groups, error: readError } = await supabase
      .from("cl_gr")
      .select(
        "code, cl_gr_text (language, text), " +
          "cl_sub_gr:cl_sub_gr!cl_sub_gr_parent_fkey (code, cl_subgr_text (language, text))"
      )
      .eq("checklist_id", checklist.id)
      .order("code");

    if (readError) throw new Error(`read: ${readError.message}`);

    console.log(JSON.stringify(groups, null, 1).slice(0, 900));

    const counts = await Promise.all(
      ["cl_gr", "cl_gr_text", "cl_sub_gr", "cl_subgr_text", "cl_action", "cl_action_text", "cl_action_values", "cl_values_text"].map(
        async (table) => {
          const column = table.startsWith("cl_gr") || table.startsWith("cl_sub") || table === "cl_action" ? null : null;
          void column;
          const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
          return `${table}=${count}`;
        }
      )
    );
    console.log("row counts (whole table): " + counts.join(" "));

    // Duplicate identity must be rejected by the unique constraint.
    const { error: dupe } = await supabase
      .from("cl_gr")
      .insert({ checklist_id: checklist.id, code: 1 });
    console.log(
      dupe
        ? `duplicate group correctly rejected: ${dupe.code}`
        : "!! duplicate group was ACCEPTED — unique constraint missing"
    );

    // An orphan sub-group must be rejected by the composite FK.
    const { error: orphan } = await supabase
      .from("cl_sub_gr")
      .insert({ checklist_id: checklist.id, code_gr: 99, code: 1 });
    console.log(
      orphan
        ? `orphan sub-group correctly rejected: ${orphan.code}`
        : "!! orphan sub-group was ACCEPTED — composite FK missing"
    );
  } finally {
    await supabase.from("checklists").delete().eq("id", checklist.id);
    const { count } = await supabase
      .from("cl_gr")
      .select("*", { count: "exact", head: true })
      .eq("checklist_id", checklist.id);
    console.log(`cleaned up; cl_gr rows left for that checklist: ${count}`);
  }
};

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
