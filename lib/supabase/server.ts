import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Supabase client that acts as the logged-in user (session stored in cookies).
 * Every query runs under RLS as that user, so only admins can write.
 */
export async function createUserClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (read-only cookies); middleware refreshes the session instead.
        }
      },
    },
  });
}

/** The logged-in user and whether they are listed in public.admins. */
export async function getAdmin() {
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false } as const;
  const { data } = await supabase.rpc('is_admin');
  return { supabase, user, isAdmin: data === true } as const;
}
