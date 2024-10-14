import { useParams } from "next/navigation";
import useChannelUsers from "./useChannelUsers";
import useUser from "./useUser";

export const useIsAdmin = () => {
  const params = useParams();
  const selectedChannel = params.channel as string;
  const channelUsers = useChannelUsers(selectedChannel);
  const user = useUser();
  return (
    channelUsers?.data?.find(
      (channelUser) => channelUser.userId === user?.data?.id
    )?.roleId === 1
  );
};
