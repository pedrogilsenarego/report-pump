import { Responsible, ResponsibleRaw } from "@/types/responsible.types";

export const mapResponsible = (profile: ResponsibleRaw): Responsible => {
  return {
    id: profile.id,
    createdAt: profile.created_at,

    condition: profile?.technician?.[0].condition,
    email: profile.email,
    phone: profile.phone,
    name: profile.display_name,
    dateIn: profile?.technician?.[0].date_in,
    dateOut: profile?.technician?.[0].date_out,
    active: profile.active,
  };
};

export const mapResponsibleToRaw = (
  profile: Omit<Responsible, "createdAt" | "id" | "active"> & {
    technicianProfile: string;
  }
): Omit<ResponsibleRaw, "created_at" | "id" | "active"> & {
  technician_profile: string;
} => {
  return {
    technician_profile: profile.technicianProfile,

    phone: profile.phone,
    email: profile.email,
    display_name: profile.name,
    date_in: profile.dateIn,
    date_out: profile.dateOut,
  };
};

export const mapResponsibles = (profiles: ResponsibleRaw[]): Responsible[] =>
  profiles.map((profile) => mapResponsible(profile));
