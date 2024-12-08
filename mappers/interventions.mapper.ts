import { Intervention, InterventionRaw } from "@/types/interventions.types";

export const mapIntervention = (profile: InterventionRaw): Intervention => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
  };
};

export const mapInterventions = (profiles: InterventionRaw[]): Intervention[] =>
  profiles.map((profile) => mapIntervention(profile));

export const mapInterventionToRaw = (
  profile: Intervention
): InterventionRaw => {
  return {
    user_id: profile.userId,
    installation_id: profile.installationId,
    checklist_id: profile.checklistId,
  };
};
