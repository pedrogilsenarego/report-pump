"use client";
import { Button } from "@/components/ui/button";
import { RouterKeys } from "@/constants/router";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const router = useRouter();

  const handleAuthClick = () => {
    router.push(RouterKeys.LOGIN); // This will redirect to /auth
  };

  return (
    <Button className="w-full" onClick={handleAuthClick}>
      Enter Here
    </Button>
  );
}
