import { ChecklistAction } from "./checklist.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Intervention = {
  id?: string;
  createdAt?: string;
  userId?: string;
  checklistId?: number;
  installationId?: string;
};

export type InterventionRaw = {
  id?: string;
  created_at?: string;
  user_id?: string;
  checklist_id?: number;
  installation_id?: string;
};

export type InterventionResultRaw = {
  checklist_id?: number;
  interventionchecklistactions: {
    checklistaction_id: number;
    value: string;
    checklistactions: {
      id: number;
      action_id: number;
      code: number;
      code_group: number;
      code_subgroup: number;
      actions: {
        description: string;
        period: number;
        pump_type: string;
      };
    };
  }[];
};
export type InterventionResult = ChecklistAction & {
  value: string;
};

/**
 * The report needs the intervention's check-list id, not just its answers: group and
 * sub-group names are per check-list, so cl_gr can only be read with it.
 */
export type InterventionResults = {
  checklistId?: number;
  results: InterventionResult[];
};
