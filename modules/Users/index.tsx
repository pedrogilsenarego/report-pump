import * as React from "react";
import UsersPending from "../Main/components/UsersPending";
import { Button } from "@/components/ui/button";
import { KeyRoles } from "@/constants/roles";
import WithRole from "@/hoc/WithRole";

export default function Users() {
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        style={{ justifyContent: "end" }}
        className="w-full flex justify-end "
      >
        <WithRole roleKey={[KeyRoles.SUPPLYER, KeyRoles.CUSTOMER]}>
          <Button>New Technician</Button>
        </WithRole>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        <WithRole roleKey={[KeyRoles.ADMIN]}>
          <UsersPending />
        </WithRole>
      </div>
    </div>
  );
}
