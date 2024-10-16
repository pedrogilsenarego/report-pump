import LogoutButton from "@/components/logout";
import * as React from "react";
import UsersPending from "./components/UsersPending";
import WithAdmin from "@/hoc/WithAdmin";

export default function Main() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <WithAdmin>
        <UsersPending />
      </WithAdmin>
      <LogoutButton />
    </div>
  );
}
