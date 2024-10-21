import { Installation, InstallationRaw } from "@/types/installation.types";

export const mapInstallation = (profile: InstallationRaw): Installation => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    name: profile.name,
    condition: profile.condition,
    area: profile.area,
    address: profile.address,
    profileId: profile.profile_id,
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
    profile_id: profile.profileId,
  };
};

export const mapInstallations = (profiles: InstallationRaw[]): Installation[] =>
  profiles.map((profile) => mapInstallation(profile));
