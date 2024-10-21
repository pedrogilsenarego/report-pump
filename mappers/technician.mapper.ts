import { Technician, TechnicianRaw } from "@/types/technician.types";

export const mapTechnician = (profile: TechnicianRaw): Technician => {
  return {
    id: profile.id,
    createdAt: profile.created_at,
    function: profile.function,
    condition: profile.condition,
    email: profile.email,
    phone: profile.phone,
    technicianProfile: profile.technician_profile,
    name: profile.name,
    certification: profile.certification,
  };
};

export const mapTechnicianToRaw = (
  profile: Omit<Technician, "createdAt" | "id"> & { technicianProfile: string }
): Omit<TechnicianRaw, "created_at" | "id"> & {
  technician_profile: string;
} => {
  return {
    technician_profile: profile.technicianProfile,
    function: profile.function,
    condition: profile.condition,
    phone: profile.phone,
    email: profile.email,
    name: profile.name,
    certification: profile.certification,
  };
};

export const mapTechnicians = (profiles: TechnicianRaw[]): Technician[] =>
  profiles.map((profile) => mapTechnician(profile));
