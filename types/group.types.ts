// Groups / Sub-Groups catalog (Action#22 loads it, Action#04 reads it).
// Names are multilingual: Report_Actions.xlsx carries them "in several languages".
export type LocalizedName = Record<string, string>;

export type Group = {
  id: number;
  createdAt: string;
  code: number;
  name: LocalizedName;
};

export type GroupRaw = {
  id: number;
  created_at: string;
  code: number;
  name: LocalizedName;
};

export type Subgroup = {
  id: number;
  createdAt: string;
  codeGroup: number;
  code: number;
  name: LocalizedName;
};

export type SubgroupRaw = {
  id: number;
  created_at: string;
  code_group: number;
  code: number;
  name: LocalizedName;
};
