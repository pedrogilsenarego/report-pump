export type Installation = {
  id: string;
  createdAt: string;
  name: string;
  area?: string;
  address?: string;
  condition?: string;
  companyId?: string;
  responsibleId?: string;
  responsibleName?: string;
};

export type InstallationRaw = {
  id: string;
  created_at: string;
  name: string;
  area?: string;
  address?: string;
  condition?: string;
  company_id?: string;
  responsible_id?: string;
  profiles?: { display_name: string };
};
