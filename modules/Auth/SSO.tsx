import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa6";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useSearchParams } from "next/navigation";
import { RouterKeys } from "@/constants/router";

export default function SSO() {
  const params = useSearchParams();
  const next = params.get("next");
  const handleLoginWithOAuth = (provider: "github" | "google" | "linkedin") => {
    const supabase = supabaseBrowser();

    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: next
          ? process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL +
            "/auth/callback?next=" +
            next
          : process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL +
            "/auth/callback?next=" +
            RouterKeys.MAIN,
      },
    });
  };
  return (
    <>
      <Button
        onClick={() => handleLoginWithOAuth("google")}
        className=" w-full flex items-center gap-2"
        variant="outline"
      >
        <FaGoogle size={20} />
        Continue with Google
      </Button>
    </>
  );
}
