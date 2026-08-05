export type Action = {
  id: number;
  createdAt: string;
  pumpType: string;
  description: string;
  period: number;
  // Catalog placement. Null until Action#22 loads Report_Actions.xlsx.
  codeGroup: number | null;
  codeSubgroup: number | null;
};

export type ActionRaw = {
  id: number;
  created_at: string;
  pump_type: string;
  description: string;
  period: number;
  code_group: number | null;
  code_subgroup: number | null;
};
