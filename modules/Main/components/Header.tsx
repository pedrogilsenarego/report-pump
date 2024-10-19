"use client";

import { useUser } from "@/hook/useUser";

export default function Header() {
  const user = useUser();
  return (
    <div
      style={{ justifyContent: "end" }}
      className="w-full  flex gap-2 border p-2"
    >
      <p>{user.data?.email}</p>
    </div>
  );
}
