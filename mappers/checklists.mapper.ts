import {
  Action,
  Checklist,
  ChecklistActionRaw,
  ChecklistRaw,
} from "@/types/checklist.types";

// Map a single ChecklistActionRaw to an Action
const mapAction = (action: ChecklistActionRaw): Action => {
  return {
    code: action.code,
    codeGroup: action.code_group,
    codeSubGroup: action.code_subgroup,
    period: action.actions?.period || "", // Default to empty string if period is undefined
    pumpType: action.actions?.pump_type || "", // Default to empty string if pump_type is undefined
  };
};

// Map an array of ChecklistActionRaw to an array of Action
const mapActions = (actions: ChecklistActionRaw[]): Action[] => {
  return actions.map((action) => mapAction(action));
};

// Map a single ChecklistRaw to a Checklist
export const mapChecklist = (profile: ChecklistRaw): Checklist => {
  return {
    id: profile.id,
    nfpaEd: profile.nfpa_ed,
    actions: profile.checklistactions
      ? mapActions(profile.checklistactions)
      : [], // Handle optional checklistActions
  };
};

// Map an array of ChecklistRaw to an array of Checklist
export const mapChecklists = (profiles: ChecklistRaw[]): Checklist[] => {
  return profiles.map((profile) => mapChecklist(profile));
};
