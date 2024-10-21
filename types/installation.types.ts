export type Installation = {
  id: string;
  createdAt: string;
  name: string;
  area?: string;
  address?: string;
  condition?: string;
  profileId?: string;
};

export type InstallationRaw = {
  id: string;
  created_at: string;
  name: string;
  area?: string;
  address?: string;
  condition?: string;
  profile_id?: string;
};
