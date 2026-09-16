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

/**
 * getPumps used to resolve the raw Supabase rows straight through, so every pump reached
 * the UI with `installation_id` and no `installationId`. The New Intervention pump-group
 * filter compares `String(pump.installationId) === installationId`, which was therefore
 * always "undefined" — picking an installation emptied the list and the screen showed
 * "There are no Pump Groups defined for this Installation!" even when one existed.
 */
export const mapPump = (profile: PumpRaw): Pump => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    installationId: profile.installation_id,
    type: profile.type,
    subType: profile.sub_type,
    condition: profile.condition,
    installations: profile.installations,
  };
};

export const mapPumps = (profiles: PumpRaw[]): Pump[] =>
  profiles.map((profile) => mapPump(profile));
