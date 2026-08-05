import { LANG } from "@/constants/lang";
import { i18n } from "@/translations/i18n";
import { LocalizedName } from "@/types/group.types";

// Catalog names come from the DB as { en: "...", pt: "..." } (Report_Actions.xlsx
// carries them in several languages), so they cannot go through the translation files.
// Resolution order: current language -> fallback (pt) -> en -> whatever exists.
export const localizedName = (name?: LocalizedName): string => {
  if (!name) return "";

  const current = i18n.language?.split("-")[0];
  const candidates = [current, LANG.pt, LANG.en].filter(Boolean) as string[];

  for (const lang of candidates) {
    if (name[lang]) return name[lang];
  }

  return Object.values(name).find(Boolean) || "";
};
