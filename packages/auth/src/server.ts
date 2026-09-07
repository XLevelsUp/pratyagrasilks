// Cookie-bound Supabase client for Server Components, route handlers and
// server actions. `server-only` is load-bearing here: next/headers works fine
// inside a transpiled workspace package, but if a client component ever
// reaches this module transitively the build fails with a confusing
// "you're importing a component that needs next/headers". This makes the
// violation explicit and greppable instead.
import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
