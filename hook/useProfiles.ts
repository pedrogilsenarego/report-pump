"use client";

import { getProfiles } from "@/actions/clientActions/profile.actions";
import { QueryKeys } from "@/constants/queryKeys";
import { Profile } from "@/types/profile.types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  profilesId: string[];
};

export default function useProfiles(props: Props) {
  return useQuery<Profile[]>({
    queryKey: [QueryKeys.PROFILES, props.profilesId],
    queryFn: () => getProfiles(props.profilesId),
  });
}
