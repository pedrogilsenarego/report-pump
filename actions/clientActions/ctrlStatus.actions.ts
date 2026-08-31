import { supabaseBrowser } from "@/lib/supabase/browser";
import { LocalizedName } from "@/types/group.types";
import { textRowsToLocalizedName } from "@/utils/specLanguage";

const supabase = supabaseBrowser();

/**
 * CTRL_STATUS — the domain of INTERVENTION.Controler_Status.
 *
 * Reference data, one row per (code, language), same 3-letter spec keys as the cl_*_text
 * tables. Seeded by 20260831_intervention_lifecycle.sql from Table_Ctrl_Status.xlsx.
 *
 * NOTE the unresolved key conflict (docs/spec-inputs.md): the xlsx keys these 1/2/3 while
 * drawing p3 gives Controler_Status as A/M/0. The xlsx wins here because it is the artifact
 * that actually gets loaded, and `code` is text so switching is an UPDATE, not a migration.
 */
export type CtrlStatus = {
  code: string;
  name: LocalizedName;
};

export const getCtrlStatus = async (): Promise<CtrlStatus[]> => {
  const { data, error } = await supabase
    .from("ctrl_status")
    .select("code, language, name")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching controller statuses:", error);
    throw new Error(error.message);
  }

  // Collapse the per-language rows into one entry per code.
  const byCode = new Map<string, Array<{ language: string; text: string }>>();
  (data || []).forEach((row) => {
    const rows = byCode.get(row.code) || [];
    rows.push({ language: row.language, text: row.name });
    byCode.set(row.code, rows);
  });

  return Array.from(byCode.entries()).map(([code, rows]) => ({
    code,
    name: textRowsToLocalizedName(rows),
  }));
};
