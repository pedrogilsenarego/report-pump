export type Checklist = {
  id: string;
  createdAt: string;
  nfpaEd: string;
  actions?: ChecklistAction[];
};

export type ChecklistRaw = {
  id: string;
  created_at: string;
  nfpa_ed: string;
  checklistactions?: ChecklistActionRaw[];
};

export type ChecklistAction = {
  checklistactionId: number;
  code: number;
  codeGroup: number;
  codeSubgroup: number;
  period: number;
  pumpType: string;
  description: string;
};

export type ChecklistActionRaw = {
  actions: {
    period: number;
    pump_type: string;
    description: string;
  };
  id: number;
  code: number;
  code_group: number;
  code_subgroup: number;
};
