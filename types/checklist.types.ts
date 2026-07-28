export type Checklist = {
  id: string;
  code?: number;
  createdAt: string;
  date?: string;
  name?: string;
  nfpaEd: string;
  companyResp?: string;
  nameResp?: string;
  phone?: string;
  email?: string;
  actions?: ChecklistAction[];
};

export type ChecklistRaw = {
  id: string;
  code?: number;
  created_at: string;
  date?: string;
  name?: string;
  nfpa_ed: string;
  company_resp?: string;
  name_resp?: string;
  ph?: string;
  email?: string;
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
