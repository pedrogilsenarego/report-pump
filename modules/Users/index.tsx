import * as React from "react";
import UsersPending from "../Main/components/UsersPending";
import { KeyRoles } from "@/constants/roles";
import WithRole from "@/hoc/WithRole";
import TechnicianList from "./components/Techncian/TechnicianList";
import ResponsibleList from "./components/Responsible/ResponsibleList";

export default function Users() {
  return (
    <div className="w-full flex flex-col gap-2">
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
      <WithRole roleKey={[KeyRoles.CUSTOMER, KeyRoles.SUPPLYER]}>
        <TechnicianList />
      </WithRole>
      <WithRole roleKey={[KeyRoles.CUSTOMER, KeyRoles.SUPPLYER]}>
        <ResponsibleList />
      </WithRole>
    </div>
  );
}
