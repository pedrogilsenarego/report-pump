import { NewChecklistType } from "@/modules/Interventions/components/NewChecklist.validation";
import {
  ChecklistAction,
  Checklist,
  ChecklistActionRaw,
  ChecklistRaw,
} from "@/types/checklist.types";

// Map a single ChecklistActionRaw to an Action
const mapAction = (checklistaction: ChecklistActionRaw): ChecklistAction => {
  return {
    code: checklistaction.code,
    codeGroup: checklistaction.code_group,
    codeSubGroup: checklistaction.code_subgroup,
    period: checklistaction.actions?.period || "",
    pumpType: checklistaction.actions?.pump_type || "",
    description: checklistaction.actions?.description || "",
    checklistactionId: checklistaction.id,
  };
};

// Map an array of ChecklistActionRaw to an array of Action
const mapActions = (actions: ChecklistActionRaw[]): ChecklistAction[] => {
  return actions.map((action) => mapAction(action));
};

// Map a single ChecklistRaw to a Checklist
export const mapChecklist = (profile: ChecklistRaw): Checklist => {
  return {
    id: profile.id,
    nfpaEd: profile.nfpa_ed,
    createdAt: profile.created_at,
    actions: profile.checklistactions
      ? mapActions(profile.checklistactions)
      : [], // Handle optional checklistActions
  };
};

// Map an array of ChecklistRaw to an array of Checklist
export const mapChecklists = (profiles: ChecklistRaw[]): Checklist[] => {
  return profiles.map((profile) => mapChecklist(profile));
};

export const mapChecklistToRaw = (
  profile: NewChecklistType
): Pick<ChecklistRaw, "nfpa_ed"> => {
  return {
    nfpa_ed: profile.nfpaEd,
  };
};
