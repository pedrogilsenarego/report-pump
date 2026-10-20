import * as React from "react";
import UsersPending from "./components/UsersPending";
import { KeyRoles } from "@/constants/roles";
import WithRole from "@/hoc/WithRole";
import SendMessage from "./components/SendMessage";
import EditRegistration from "./components/EditRegistration";
import ChangePassword from "./components/ChangePassword";
import UpdateReferenceTable from "./components/UpdateReferenceTable";
import NewChecklist from "@/modules/Interventions/components/NewChecklist";

export default function Main() {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-start gap-2">
        <WithRole roleKey={[KeyRoles.ADMIN]}>
          <NewChecklist />
          <UpdateReferenceTable kind="languages" />
          <UpdateReferenceTable kind="periodicity" />
        </WithRole>
        <WithRole roleKey={[KeyRoles.CUSTOMER, KeyRoles.SUPPLYER]}>
          <EditRegistration />
        </WithRole>
        <ChangePassword />
        <SendMessage />
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
