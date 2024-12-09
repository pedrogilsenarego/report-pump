export type Checklist = {
  id: string;
  nfpaEd: string;
  actions?: Action[];
};

export type ChecklistRaw = {
  id: string;
  nfpa_ed: string;
  checklistactions?: ChecklistActionRaw[];
};

export type Action = {
  checklistactionId: number;
  code: number;
  codeGroup: number;
  codeSubGroup: number;
  period: string;
  pumpType: string;
  description: string;
};

export type ChecklistActionRaw = {
  actions: {
    period: string;
    pump_type: string;
    description: string;
  };
  id: number;
  code: number;
  code_group: number;
  code_subgroup: number;
};
