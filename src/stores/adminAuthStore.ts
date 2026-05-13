import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'superadmin';
}

interface AdminAuthState {
    admin: AdminUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    /**
     * checkAuth — called by AdminProtectedRoute on every mount.
     * Re-validates the stored admin.id against Supabase so that
     * localStorage manipulation cannot grant admin access.
     */
    checkAuth: () => Promise<boolean>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set, get) => ({
            admin: null,

            login: async (email: string, password: string) => {
                // maybeSingle() returns null (not an error) when no row matches
                const { data, error } = await supabase
                    .from('admins')
                    .select('id, email, name, role, password_hash')
                    .eq('email', email.toLowerCase().trim())
                    .maybeSingle();

                if (error) {
                    throw new Error('Authentication service unavailable. Please try again.');
                }

                if (!data) {
                    // Generic message — do not reveal whether email exists
                    throw new Error('Invalid credentials. Access denied.');
                }

                // Verify password against the stored bcrypt hash.
                // bcryptjs is already declared in package.json.
                const bcrypt = await import('bcryptjs');
                const passwordValid = await bcrypt.compare(password, data.password_hash);

                if (!passwordValid) {
                    throw new Error('Invalid credentials. Access denied.');
                }

                set({
                    admin: {
                        id:    data.id,
                        email: data.email,
                        name:  data.name,
                        role:  data.role,
                    },
                });

                // Record last login — fire-and-forget, non-blocking
                supabase
                    .from('admins')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', data.id)
                    .then(() => { /* intentionally empty */ });
            },

            logout: () => {
                set({ admin: null });
            },

            checkAuth: async () => {
                const { admin } = get();
                if (!admin?.id) return false;

                // Re-query Supabase to confirm the admin record still exists.
                // This prevents localStorage manipulation from unlocking admin routes.
                const { data, error } = await supabase
                    .from('admins')
                    .select('id')
                    .eq('id', admin.id)
                    .maybeSingle();

                if (error || !data) {
                    set({ admin: null });
                    return false;
                }
                return true;
            },
        }),
        {
            name: 'astra-admin-auth',
            storage: createJSONStorage(() => localStorage),
            // Only persist the identity object — NOT an isAuthenticated boolean.
            // Route protection is always re-validated server-side via checkAuth().
            partialize: (state) => ({ admin: state.admin }),
        }
    )
);
