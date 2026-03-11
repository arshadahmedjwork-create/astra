import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface Customer {
    id: string;
    customer_id: string;
    mobile: string;
    full_name: string | null;
    email?: string;
    dob?: string;
    gender?: string;
    photo_base64?: string;
    address?: {
        id: string;
        door_no: string;
        street: string;
        landmark: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        alt_mobile: string;
        lat?: number;
        lng?: number;
    };
}

interface AuthState {
    customer: Customer | null;
    isAuthenticated: boolean;
    setAuth: (session: any, customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            customer: null,
            isAuthenticated: false,
            setAuth: (session, customer) => {
                // Ensure address is an object, not an array
                const formattedCustomer = {
                    ...customer,
                    address: Array.isArray(customer.address) ? customer.address[0] : customer.address
                };
                set({ customer: formattedCustomer, isAuthenticated: true });
            },
            updateCustomer: (customer) => {
                set({ customer });
            },
            logout: async () => {
                await supabase.auth.signOut();
                set({ customer: null, isAuthenticated: false });
            },
            checkSession: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    set({ customer: null, isAuthenticated: false });
                    return;
                }

                if (session?.user?.phone) {
                    const phone = session.user.phone;
                    const phoneRaw = phone.startsWith('+91') ? phone.slice(3) : phone;

                    const { data: customer } = await supabase
                        .from('customers')
                        .select('*, address:addresses(*)')
                        .or(`mobile.eq.${phone},mobile.eq.${phoneRaw}`)
                        .single();

                    if (customer) {
                        // Handle address array
                        const formattedCustomer = {
                            ...customer,
                            address: Array.isArray(customer.address) ? customer.address[0] : customer.address
                        };
                        set({ customer: formattedCustomer, isAuthenticated: true });
                        return;
                    }
                }

                set({ customer: null, isAuthenticated: false });
            }
        }),
        {
            name: 'astra-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
