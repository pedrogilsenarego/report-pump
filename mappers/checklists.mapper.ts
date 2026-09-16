import { Checklist, ChecklistRaw } from "@/types/checklist.types";

// Map a single ChecklistRaw to a Checklist
export const mapChecklist = (profile: ChecklistRaw): Checklist => {
  return {
    id: profile.id,
    code: profile.code,
    nfpaEd: profile.nfpa_ed,
    createdAt: profile.created_at,
    date: profile.date,
    name: profile.name,
    companyResp: profile.company_resp,
    nameResp: profile.name_resp,
    phone: profile.ph,
    email: profile.email,
  };
};

// Map an array of ChecklistRaw to an array of Checklist
export const mapChecklists = (profiles: ChecklistRaw[]): Checklist[] => {
  return profiles.map((profile) => mapChecklist(profile));
};
