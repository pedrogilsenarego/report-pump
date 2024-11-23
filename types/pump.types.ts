export type Pump = {
  id: string;
  createdAt: string;
  installationId?: string;
  type?: string;
  condition?: string;
  installations?: {
    name?: string;
  };
};

export type PumpRaw = {
  id: string;
  created_at: string;
  installation_id?: string;
  type?: string;
  condition?: string;
};
