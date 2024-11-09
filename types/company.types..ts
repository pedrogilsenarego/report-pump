export type Company = {
  id: string;
  createdAt: string;
  email: string;
  role: string;
  country: string;
  address: string;
  nameCompany: string;
  phone?: string;
  defaultLang: string;
};

export type CompanyRaw = {
  id: string;
  created_at: string;
  email: string;
  role: string;
  country: string;
  address: string;
  company_name: string;
  phone?: string;
  default_language: string;
};
