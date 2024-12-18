export type Action = {
  id: number;
  createdAt: string;
  pumpType: string;
  description: string;
  period: number;
};

export type ActionRaw = {
  id: number;
  created_at: string;
  pump_type: string;
  description: string;
  period: number;
};
