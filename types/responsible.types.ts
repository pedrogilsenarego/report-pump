export type Responsible = {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  condition?: string;
  dateIn?: string;
  dateOut?: string;
  phone?: string;
  active: boolean;
};

export type ResponsibleRaw = {
  id: string;
  created_at: string;
  email?: string;
  active: boolean;
  date_in?: string;
  date_out?: string;
  display_name: string;
  phone?: string;
  technician?: { condition: string; date_in: string; date_out: string }[];
};
