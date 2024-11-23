export type Pump = {
  id: string;
  createdAt: string;
  installationId?: string;
  type?: string;
  condition?: string;
};

export type PumpRaw = {
  id: string;
  created_at: string;
  installation_id?: string;
  type?: string;
  condition?: string;
};
