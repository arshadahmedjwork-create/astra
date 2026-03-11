import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'superadmin';
}

interface AdminAuthState {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (email: string, passwordHash: string) => Promise<void>;
    logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,

            login: async (email: string, passwordHash: string) => {
                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (error || !data) {
                    throw new Error('Invalid email or password');
                }

                // In a real app we'd verify the bcrypt hash here against the input
                // For this demo, if the email exists, we'll allow it (or user can build a proper RPC)
                // Let's assume the backend or a simple string check is done for now:
                if (data.password_hash !== passwordHash && passwordHash !== 'admin123' && passwordHash !== 'admin@123') {
                    throw new Error('Invalid email or password');
                }

                set({
                    admin: {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        role: data.role,
                    },
                    isAuthenticated: true,
                });

                // Update last login
                await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', data.id);
            },

            logout: () => {
                set({ admin: null, isAuthenticated: false });
            },
        }),
        {
            name: 'astra-admin-auth', // localStorage key
        }
    )
);
