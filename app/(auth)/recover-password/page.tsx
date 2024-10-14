"use client";

import { Suspense } from "react";
import RecoverComponent from "./RecoverComponent";

export default function AuthComponent() {
  return (
    <Suspense>
      <RecoverComponent />
    </Suspense>
  );
}
