import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * The logged-in user, read from the locally stored session — a drop-in for
 * `supabase.auth.getUser()` in browser-side actions, with the same `{ data: { user } }` shape.
 *
 * `getUser()` is a network round trip to the auth server on every call. The client actions
 * all called it before their real query, purely as a "logged in?" guard, which put an extra
 * round trip in front of nearly every read. RLS already verifies the JWT on the database
 * side, so the client-side check only needs to know whether there is a session.
 * `getSession()` reads it from storage and only hits the network to refresh an expired token.
 *
 * Server code (route handlers, server actions) must keep using `getUser()`: there the
 * session cookie is untrusted input and needs verifying.
 */
export async function getSessionUser(): Promise<{
  data: { user: User | null };
}> {
  const { data } = await supabaseBrowser().auth.getSession();
  return { data: { user: data.session?.user ?? null } };
}
