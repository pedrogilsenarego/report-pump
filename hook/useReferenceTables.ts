"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LanguageEntry,
  PeriodicityEntry,
  getLanguages,
  getPeriodicity,
} from "@/actions/clientActions/referenceTables.actions";
import { QueryKeys } from "@/constants/queryKeys";
import { PERIODICITY, periodLabel } from "@/constants/actions";
import { appLanguage } from "@/utils/specLanguage";
import { i18n } from "@/translations/i18n";

/**
 * PERIODICITY codes and their labels in the UI language, from the `periodicity` table
 * (Action#23). Until the table loads — or if it is missing or empty — the built-in eight
 * codes and their i18n labels are used, so a label is never blank.
 */
export function usePeriodicity() {
  const query = useQuery<PeriodicityEntry[]>({
    queryKey: [QueryKeys.PERIODICITY],
    queryFn: getPeriodicity,
    // Reference data — only an administrator's upload changes it.
    staleTime: Infinity,
  });

  const rows = query.data ?? [];
  const lang = (i18n.language || "pt").slice(0, 2);

  const label = (code?: number | string | null): string => {
    if (code == null || code === "") return "";
    const forCode = rows.filter((row) => row.code === Number(code));
    const match =
      forCode.find((row) => appLanguage(row.language) === lang) ??
      forCode.find((row) => appLanguage(row.language) === "en");
    return match?.text ?? periodLabel(code);
  };

  const codes = rows.length
    ? Array.from(new Set(rows.map((row) => row.code))).sort((a, b) => a - b)
    : PERIODICITY.map((entry) => entry.code as number);

  return { codes, label, isLoading: query.isLoading };
}

/** LANGUAGE (Action#22). Empty until the table exists. */
export function useLanguages() {
  return useQuery<LanguageEntry[]>({
    queryKey: [QueryKeys.LANGUAGES],
    queryFn: getLanguages,
    staleTime: Infinity,
  });
}
