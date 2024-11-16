import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsersPending } from "@/hook/useUser";

type Props = {
  open: boolean;
  onOpenChange: (signal: boolean) => void;
  userIndex: number | null;
};

export default function UserPendingDetail(props: Props) {
  const usersPending = useUsersPending();
  if (props.userIndex === null) return;
  const user = usersPending?.data?.[props.userIndex];

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user?.display_name}</DialogTitle>
          <DialogDescription>
            <div
              style={{ color: "black" }}
              className="mt-2 flex flex-col gap-2"
            >
              <div>
                <CardTitle>Email</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
              <div>
                <CardTitle>Phone</CardTitle>
                <CardDescription>{user?.phone}</CardDescription>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
