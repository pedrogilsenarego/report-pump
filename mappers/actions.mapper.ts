import { Action, ActionRaw } from "@/types/action.types";

export const mapActionToRaw = (action: Partial<Action>): Partial<ActionRaw> => {
  return {
    description: action.description,
    period: action.period,
    pump_type: action.pumpType,
    code_group: action.codeGroup,
    code_subgroup: action.codeSubgroup,
  };
};

const mapAction = (action: ActionRaw): Action => {
  return {
    id: action.id,
    description: action.description,
    createdAt: action.created_at,
    period: action.period,
    pumpType: action.pump_type,
    codeGroup: action.code_group ?? null,
    codeSubgroup: action.code_subgroup ?? null,
  };
};
// Map an array of ChecklistRaw to an array of Checklist
export const mapActions = (profiles: ActionRaw[]): Action[] => {
  return profiles.map((profile) => mapAction(profile));
};
