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
      };
    };
  }[];
};
export type InterventionResult = {
  code: number;
  codeGroup: number;
  codeSubgroup: number;
  description: string;
  value: string;
};
