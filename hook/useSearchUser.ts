import { searchUsersByEmail } from "@/actions/clientActions/userActions";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  searchValue: string;
  enabled?: boolean;
  channelId?: string;
};

export default function useSearchUserByEmail({
  searchValue,
  enabled = true,
  channelId,
}: Props) {
  const usersByEmail = useQuery<User[], Error>({
    queryKey: ["users-by-email", searchValue, channelId],
    queryFn: () => searchUsersByEmail(searchValue, channelId),
    enabled: enabled,
  });

  return usersByEmail;
}
