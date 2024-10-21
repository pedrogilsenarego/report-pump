import * as React from "react";
import UsersPending from "../Main/components/UsersPending";
import { KeyRoles } from "@/constants/roles";
import WithRole from "@/hoc/WithRole";
import NewTecnician from "./components/NewTechnician";

export default function Users() {
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        style={{ justifyContent: "end" }}
        className="w-full flex justify-end "
      >
        <WithRole roleKey={[KeyRoles.CUSTOMER]}>
          <NewTecnician />
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
