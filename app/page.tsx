import { Suspense } from "react";
import Landscape from "@/modules/LandScape";

export default function Home() {
  return (
    <div>
      <Suspense>
        <Landscape />
      </Suspense>
    </div>
  );
}
