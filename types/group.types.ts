/**
 * Check-list groups / sub-groups (spec tables CL_GR / CL_SUB_GR).
 *
 * These are NOT a global catalog — they belong to one check-list. Form1_Groups.xlsx ships
 * groups 1-4 once per check-list template with different names, so `code` is only unique
 * within a `checklistId`. Action#04 creates them; there is no CRUD screen in the spec,
 * which is why there is no addGroup / addSubgroup any more.
 *
 * Names live in the sibling cl_gr_text / cl_subgr_text tables, one row per language, and
 * are collapsed into `name` on read by textRowsToLocalizedName.
 */

/** { pt: "...", en: "..." } — app 2-letter keys, mapped from the spec's PTG / ENG. */
export type LocalizedName = Record<string, string>;

/** A cl_gr_text / cl_subgr_text row as it comes back from Supabase. */
export type TextRaw = {
  language: string;
  text: string;
};

export type Group = {
  id: number;
  createdAt: string;
  checklistId: number;
  code: number;
  name: LocalizedName;
};

export type GroupRaw = {
  id: number;
  created_at: string;
  checklist_id: number;
  code: number;
  cl_gr_text?: TextRaw[] | null;
};

export type Subgroup = {
  id: number;
  createdAt: string;
  checklistId: number;
  codeGroup: number;
  code: number;
  name: LocalizedName;
};

export type SubgroupRaw = {
  id: number;
  created_at: string;
  checklist_id: number;
  code_gr: number;
  code: number;
  cl_subgr_text?: TextRaw[] | null;
};
