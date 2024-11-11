export type Technician = {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  function?: string;
  condition?: string;
  certification?: string;
  phone?: string;
};

export type TechnicianRaw = {
  id: string;
  created_at: string;
  email?: string;
  display_name: string;
  function?: string;
  condition?: string;
  certification?: string;
  phone?: string;
  technician?: { certification: string; condition: string; function: string }[];
};
