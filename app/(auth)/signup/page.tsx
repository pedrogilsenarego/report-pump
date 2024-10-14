"use client";

import { Suspense } from "react";
import SignupComponent from "./SignupComponent";

export default function AuthComponent() {
  return (
    <Suspense>
      <SignupComponent />
    </Suspense>
  );
}
