import * as React from "react";
import WithAdmin from "@/hoc/WithAdmin";
import UsersPending from "../Main/components/UsersPending";
import { Button } from "@/components/ui/button";

export default function Users() {
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        style={{ justifyContent: "end" }}
        className="w-full flex justify-end "
      >
        <Button>New Technician</Button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        <WithAdmin>
          <UsersPending />
        </WithAdmin>
        <WithAdmin>
          <UsersPending />
        </WithAdmin>
      </div>
    </div>
  );
}
