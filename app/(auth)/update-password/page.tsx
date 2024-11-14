"use client";

import { Suspense } from "react";
import ResetComponent from "./ResetComponent";

export default function AuthComponent() {
  return (
    <Suspense>
      <ResetComponent />
    </Suspense>
  );
}
