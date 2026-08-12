import { LocalizedName } from "@/types/group.types";

/**
 * The spec keys languages with 3 letters (Table_Language.xlsx: PTG / ENG / ENS / ENU /
 * FRA / ESP / GER) while the app's i18n uses 2. The cl_*_text tables store the spec key
 * verbatim — normalising on write would collapse ENG / ENS / ENU into one row and lose
 * data — so the mapping happens here, on read.
 */
const SPEC_TO_APP: Record<string, string> = {
  PTG: "pt",
  ENG: "en",
  ENS: "en", // English (simplified / US spelling variants in the spec's list)
  ENU: "en",
  FRA: "fr",
  ESP: "es",
  GER: "de",
};

export const appLanguage = (specLanguage: string): string =>
  SPEC_TO_APP[specLanguage.toUpperCase()] ||
  specLanguage.slice(0, 2).toLowerCase();

/**
 * Collapses `_text` rows into the { pt: "...", en: "..." } shape `localizedName` reads.
 * Where several spec keys map to one app language (ENG / ENS / ENU -> en) the first row
 * wins, so a plain ENG name is not overwritten by a variant.
 */
export const textRowsToLocalizedName = (
  rows?: Array<{ language: string; text: string }> | null
): LocalizedName => {
  const name: LocalizedName = {};

  (rows || []).forEach((row) => {
    if (!row?.language || !row?.text) return;
    const key = appLanguage(row.language);
    if (!name[key]) name[key] = row.text;
  });

  return name;
};
