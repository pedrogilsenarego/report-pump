import { supabaseBrowser } from "@/lib/supabase/browser";

const supabase = supabaseBrowser();

export type PeriodicityEntry = { code: number; language: string; text: string };
export type LanguageEntry = {
  code: string;
  name: string;
  country: string | null;
  flag: string | null;
};

/**
 * Reference data maintained by Action#22 / #23. Errors resolve to [] rather than throwing:
 * callers fall back to the built-in values, so the app still labels periods correctly
 * before 20261021_language_periodicity.sql is applied.
 */
export const getPeriodicity = async (): Promise<PeriodicityEntry[]> => {
  const { data, error } = await supabase
    .from("periodicity")
    .select("code, language, text")
    .order("code");
  if (error) {
    console.warn("periodicity table unavailable, using built-in labels:", error.message);
    return [];
  }
  return (data || []) as PeriodicityEntry[];
};

export const getLanguages = async (): Promise<LanguageEntry[]> => {
  const { data, error } = await supabase
    .from("languages")
    .select("code, name, country, flag")
    .order("code");
  if (error) {
    console.warn("languages table unavailable:", error.message);
    return [];
  }
  return (data || []) as LanguageEntry[];
};
