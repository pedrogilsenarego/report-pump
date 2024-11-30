import { Intervention, InterventionRaw } from "@/types/interventions.types";

export const mapIntervention = (profile: InterventionRaw): Intervention => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
  };
};

export const mapInterventions = (profiles: InterventionRaw[]): Intervention[] =>
  profiles.map((profile) => mapIntervention(profile));
