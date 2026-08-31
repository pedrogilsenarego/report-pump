export type Pump = {
  // pumps.id is a bigint too — see the note on Checklist.id.
  id: number;
  createdAt: string;
  installationId?: string;
  type?: string;
  condition?: string;
  installations?: {
    name?: string;
  };
};

export type PumpRaw = {
  id: number;
  created_at: string;
  installation_id?: string;
  type?: string;
  condition?: string;
};
