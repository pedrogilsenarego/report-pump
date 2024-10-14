import { Suspense } from "react";

import AuthComponent from "./AuthComponent";

export default function Page() {
  return (
    <Suspense>
      <AuthComponent />
    </Suspense>
  );
}
