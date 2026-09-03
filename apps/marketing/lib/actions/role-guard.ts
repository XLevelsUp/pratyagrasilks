'use server';

import { createClient } from '@/lib/supabase/server';
import { type UserRole } from '@/lib/constants/roles';

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
