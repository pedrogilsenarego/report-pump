import { Profile, ProfileRaw } from "@/types/profile.types";

export const mapProfile = (profile: ProfileRaw): Profile => {
  return {
    id: profile.id,
    displayName: profile.display_name,
    imageUrl: profile.image_url,
    lastActivity: profile.last_activity,
  };
};

export const mapProfiles = (profiles: ProfileRaw[]): Profile[] =>
  profiles.map((profile) => mapProfile(profile));
