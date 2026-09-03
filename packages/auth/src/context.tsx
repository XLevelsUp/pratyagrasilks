'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signInWithGoogle: (redirectPath?: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // The Supabase SDK (~43KB) is dynamically imported instead of bundled
    // eagerly, so it downloads after first paint instead of blocking it —
    // every page mounts AuthProvider, including ones with no auth-gated UI.
    // getClient() lazily creates and caches a single instance so every
    // caller (the effect below, and the action functions) shares one client.
    const clientRef = useRef<SupabaseClient | null>(null);
    const getClient = async () => {
        if (!clientRef.current) {
            // Relative, not a '@pratyagra/auth/client' self-reference: the
            // package's own exports map would resolve it, but that adds a
            // failure surface for no benefit.
            const { createClient } = await import('./client');
            clientRef.current = createClient();
        }
        return clientRef.current;
    };

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        getClient().then((supabase) => {
            if (cancelled) return;

            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            unsubscribe = () => subscription.unsubscribe();
        });

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        if (password.length > 20) {
            return { error: new Error('Password must not exceed 20 characters.') };
        }
        const supabase = await getClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        if (password.length > 20) {
            return { error: new Error('Password must not exceed 20 characters.') };
        }
        const supabase = await getClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signInWithGoogle = async (redirectPath?: string) => {
        const next = redirectPath || '/';
        const supabase = await getClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
        return { error };
    };

    const signOut = async () => {
        const supabase = await getClient();
        await supabase.auth.signOut();
    };

    const refreshUser = async () => {
        const supabase = await getClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
