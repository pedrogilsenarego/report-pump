import { Technician, TechnicianRaw } from "@/types/technician.types";

export const mapTechnician = (profile: TechnicianRaw): Technician => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    function: profile?.technician?.[0].function,
    condition: profile?.technician?.[0].condition,
    email: profile.email,
    phone: profile.phone,
    name: profile.display_name,
    certification: profile?.technician?.[0].certification,
    active: profile.active,
  };
};

export const mapTechnicianToRaw = (
  profile: Omit<Technician, "createdAt" | "id" | "active"> & {
    technicianProfile: string;
  }
): Omit<TechnicianRaw, "created_at" | "id" | "active"> & {
  technician_profile: string;
} => {
  return {
    technician_profile: profile.technicianProfile,
    function: profile.function,
    condition: profile.condition,
    phone: profile.phone,
    email: profile.email,
    display_name: profile.name,
    certification: profile.certification,
  };
};

export const mapTechnicians = (profiles: TechnicianRaw[]): Technician[] =>
  profiles.map((profile) => mapTechnician(profile));
