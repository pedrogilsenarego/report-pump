import { Company, CompanyRaw } from "@/types/company.types.";

export const mapCompany = (profile: CompanyRaw): Company => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    email: profile.email,
    role: profile.role,
    country: profile.country,
    phone: profile.phone,
    defaultLang: profile.default_language,
    nameCompany: profile.company_name,
    address: profile.address,
  };
};

export const mapCompanyToRaw = (
  profile: Omit<Company, "createdAt" | "id">
): Omit<CompanyRaw, "created_at" | "id"> => {
  return {
    email: profile.email,
    role: profile.role,
    country: profile.country,
    address: profile.address,
    default_language: profile.defaultLang,
    company_name: profile.nameCompany,
    phone: profile.phone,
  };
};

export const mapInstallations = (profiles: CompanyRaw[]): Company[] =>
  profiles.map((profile) => mapCompany(profile));
