import {
  Intervention,
  InterventionRaw,
  InterventionResult,
  InterventionResultRaw,
} from "@/types/interventions.types";

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

export const mapInterventionResults = (
  interventions: InterventionResultRaw
): InterventionResult[] => {
  return interventions.interventionchecklistactions.map((intervention) => {
    console.log(intervention);
    return {
      value: intervention.value,
      description: intervention.checklistactions.actions.description,
      code: intervention.checklistactions.code,
      codeGroup: intervention.checklistactions.code_group,
      codeSubgroup: intervention.checklistactions.code_subgroup,
    };
  });
};
