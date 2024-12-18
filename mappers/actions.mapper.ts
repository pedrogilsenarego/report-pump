import { Action, ActionRaw } from "@/types/action.types";

export const mapActionToRaw = (action: Partial<Action>): Partial<ActionRaw> => {
  return {
    description: action.description,

    period: action.period,
  };
};

const mapAction = (action: ActionRaw): Action => {
  return {
    id: action.id,
    description: action.description,
    createdAt: action.created_at,
    period: action.period,
    pumpType: action.pump_type,
  };
};
// Map an array of ChecklistRaw to an array of Checklist
export const mapActions = (profiles: ActionRaw[]): Action[] => {
  return profiles.map((profile) => mapAction(profile));
};
