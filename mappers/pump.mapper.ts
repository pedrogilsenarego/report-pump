import { Installation, InstallationRaw } from "@/types/installation.types";
import { Pump, PumpRaw } from "@/types/pump.types";

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

export const mapPumpToRaw = (
  profile: Omit<Pump, "createdAt" | "id">
): Omit<PumpRaw, "created_at" | "id"> => {
  return {
    type: profile.type,
    condition: profile.condition,
    installation_id: profile.installationId,
  };
};

export const mapInstallations = (profiles: InstallationRaw[]): Installation[] =>
  profiles.map((profile) => mapInstallation(profile));
