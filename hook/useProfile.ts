"use client";

import { getProfile } from "@/actions/clientActions/profile.actions";
import { QueryKeys } from "@/constants/queryKeys";
import { Profile } from "@/types/profile.types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  profileId: string;
};

export default function useProfile(props: Props) {
  return useQuery<Profile>({
    queryKey: [QueryKeys.PROFILE, props.profileId],
    queryFn: () => getProfile(props.profileId),
  });
}
