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
      {/*
        INST_RESPONSABLE belongs to installations, which only customers have. A provider's
        responsable is SUPPLYER:Name_Responsable1 — part of Edit Registration (Screen#05).
      */}
      <WithRole roleKey={[KeyRoles.CUSTOMER]}>
        <ResponsibleList />
      </WithRole>
    </div>
  );
}
