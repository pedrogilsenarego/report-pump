import * as React from "react";
import UsersPending from "./components/UsersPending";
import { KeyRoles } from "@/constants/roles";
import WithRole from "@/hoc/WithRole";
import { ChartTest } from "./components/Chart";

export default function Main() {
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
        <ChartTest />
      </div>
    </div>
  );
}
