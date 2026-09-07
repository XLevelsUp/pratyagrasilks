export type UserRole = 'ADMIN' | 'CASHIER' | 'CUSTOMER' | 'VENDOR' | 'MARKETING';

/** Roles that may enter the /admin area. */
export const ADMIN_LEVEL_ROLES: readonly UserRole[] = ['ADMIN', 'CASHIER', 'MARKETING'] as const;

export function isAdminLevelRole(role: UserRole | null): boolean {
    return role !== null && (ADMIN_LEVEL_ROLES as readonly string[]).includes(role);
}
