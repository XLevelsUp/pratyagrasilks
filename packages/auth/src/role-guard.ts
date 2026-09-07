/**
 * Server-side role checks. Call at the top of any privileged server action or
 * route handler.
 *
 * Deliberately NOT 'use server'. All callers are themselves server modules
 * (the *.actions.ts files carry their own directive, plus two route
 * handlers) — nothing client-side imports this, so it was never invoked as a
 * Server Action.
 *
 * Keeping the directive here would be actively dangerous now that this lives
 * in a workspace package: Next 14 derives Server Action IDs from the module's
 * resolved file path, and under pnpm's isolated store that path differs
 * between the build container and the traced Lambda filesystem. The result is
 * "Failed to find Server Action <hash>" — a runtime 500 that never appears in
 * next build and only fires when a user clicks. Dropping the directive keeps
 * this module out of the action manifest entirely.
 *
 * `server-only` turns any accidental client import into a build error rather
 * than a leaked privileged call.
 */

import 'server-only';

import { createClient } from './server';
import { type UserRole } from '@pratyagra/core/constants/roles';

/** Returns the UserRole of the currently authenticated caller, or null if unauthenticated. */
export async function getCallerRole(): Promise<UserRole | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return (data?.role as UserRole) ?? null;
}

/** Throws if the caller's role is not ADMIN. Call at the top of any destructive server action. */
export async function assertAdminOnly(role: UserRole | null, action: string): Promise<void> {
    if (role !== 'ADMIN') {
        throw new Error(`Role '${role}' is not authorised to ${action}.`);
    }
}

/** Throws if the caller's role is not one of `allowed`. For actions shared by multiple roles (e.g. blog CRUD: ADMIN + MARKETING). */
export async function assertRoleIn(
    role: UserRole | null,
    allowed: UserRole[],
    action: string,
): Promise<void> {
    if (role === null || !allowed.includes(role)) {
        throw new Error(`Role '${role}' is not authorised to ${action}.`);
    }
}
