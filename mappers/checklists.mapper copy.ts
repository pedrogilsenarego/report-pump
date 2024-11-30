import { Checklist, ChecklistRaw } from "@/types/checklist.types";

export const mapChecklist = (profile: ChecklistRaw): Checklist => {
  return {
    id: profile.id,
    nfpaEd: profile.nfpa_ed,
  };
};

export const mapChecklists = (profiles: ChecklistRaw[]): Checklist[] =>
  profiles.map((profile) => mapChecklist(profile));
