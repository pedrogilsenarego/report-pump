import { Installation, InstallationRaw } from "@/types/installation.types";

export const mapInstallation = (profile: InstallationRaw): Installation => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    name: profile.name,
    condition: profile.condition,
    area: profile.area,
    address: profile.address,
    companyId: profile.company_id,
    responsibleId: profile.responsible_id,
    responsibleName: profile.profiles?.display_name,
  };
};

export const mapInstallationToRaw = (
  profile: Omit<Installation, "createdAt" | "id">
): Omit<InstallationRaw, "created_at" | "id"> => {
  return {
    name: profile.name,
    condition: profile.condition,
    area: profile.area,
    address: profile.address,
    company_id: profile.companyId,
    responsible_id: profile.responsibleId,
  };
};

export const mapInstallations = (profiles: InstallationRaw[]): Installation[] =>
  profiles.map((profile) => mapInstallation(profile));
