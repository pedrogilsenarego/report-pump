"use client";

import LogoutButton from "@/components/logout";
import { keyRolesComplete } from "@/constants/roles";
import { useUser } from "@/hook/useUser";

export default function Header() {
  const user = useUser();
  return (
    <div
      style={{
        justifyContent: "end",
        alignItems: "center",
        borderBottom: "solid 1px lightgray",
      }}
      className="w-full  flex gap-2 p-2"
    >
      <p style={{ textTransform: "capitalize" }} className="font-medium">
        {keyRolesComplete.find((role) => role.id === user.data?.role)?.value}
      </p>
      <p>{user.data?.email}</p>
      <LogoutButton />
    </div>
  );
}
