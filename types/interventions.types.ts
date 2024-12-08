export type Intervention = {
  id?: string;
  createdAt?: string;
  userId?: string;
  checklistId?: number;
  installationId?: string;
};

export type InterventionRaw = {
  id?: string;
  created_at?: string;
  user_id?: string;
  checklist_id?: number;
  installation_id?: string;
};
