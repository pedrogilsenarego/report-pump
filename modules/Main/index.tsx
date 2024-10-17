import LogoutButton from "@/components/logout";
import * as React from "react";
import UsersPending from "./components/UsersPending";
import WithAdmin from "@/hoc/WithAdmin";

export default function Main() {
  return (
    <div>
      <WithAdmin>
        <UsersPending />
      </WithAdmin>
      <LogoutButton />
    </div>
  );
}
