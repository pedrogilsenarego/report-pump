export type Technician = {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  function?: string;
  condition?: string;
  certification?: string;
  phone?: string;
  technicianProfile: string;
};

export type TechnicianRaw = {
  id: string;
  created_at: string;
  email?: string;
  name: string;
  function?: string;
  condition?: string;
  certification?: string;
  phone?: string;
  technician_profile: string;
};
