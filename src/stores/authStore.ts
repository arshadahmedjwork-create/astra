import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Customer {
    id: string;
    customer_id: string;
    full_name: string;
    gender: string;
    mobile: string;
    email?: string;
    dob?: string;
    photo_base64?: string;
    marital_status?: string;
    marriage_date?: string;
    wallet_balance?: number;
    assigned_driver_id?: string;
    address?: {
        id: string;
        state: string;
        city: string;
        door_no?: string;
        street?: string;
        landmark: string;
        area: string;
        pincode: string;
        alt_mobile?: string;
        lat?: number;
        lng?: number;
    };
}

interface AuthState {
    customer: Customer | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setCustomer: (customer: Customer | null) => void;
    login: (mobile: string) => Promise<Customer | null>;
    loginByCustomerId: (customerId: string) => Promise<Customer | null>;
    logout: () => void;
    fetchProfile: (customerId: string) => Promise<Customer | null>;
    updateProfile: (id: string, data: Partial<Customer>) => Promise<boolean>;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            customer: null,
            isAuthenticated: false,
            isLoading: false,

            setCustomer: (customer) => set({
                customer,
                isAuthenticated: !!customer,
            }),

            login: async (mobile: string) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase
                        .from('customers')
                        .select('*, addresses(*)')
                        .eq('mobile', mobile)
                        .single();

                    if (error || !data) {
                        set({ isLoading: false });
                        return null;
                    }

                    const customer: Customer = {
                        ...data,
                        address: data.addresses?.[0] || null,
                    };

                    set({ customer, isAuthenticated: true, isLoading: false });
                    return customer;
                } catch {
                    set({ isLoading: false });
                    return null;
                }
            },

            loginByCustomerId: async (customerId: string) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase
                        .from('customers')
                        .select('*, addresses(*)')
                        .eq('customer_id', customerId)
                        .single();

                    if (error || !data) {
                        set({ isLoading: false });
                        return null;
                    }

                    const customer: Customer = {
                        ...data,
                        address: data.addresses?.[0] || null,
                    };

                    set({ customer, isAuthenticated: true, isLoading: false });
                    return customer;
                } catch {
                    set({ isLoading: false });
                    return null;
                }
            },

            logout: () => set({ customer: null, isAuthenticated: false }),

            fetchProfile: async (id: string) => {
                const { data: customerData, error: customerError } = await supabase
                    .from('customers')
                    .select('*, addresses(*)')
                    .eq('id', id)
                    .single();

                if (customerError || !customerData) return null;

                const customer: Customer = {
                    ...customerData,
                    address: customerData.addresses?.[0] || null,
                };

                set({ customer, isAuthenticated: true });
                return customer;
            },

            refreshProfile: async () => {
                const { customer } = get();
                if (!customer?.id) return;
                
                const { data: customerData, error } = await supabase
                    .from('customers')
                    .select('*, addresses(*)')
                    .eq('id', customer.id)
                    .single();

                if (error || !customerData) return;

                const updatedCustomer: Customer = {
                    ...customerData,
                    address: customerData.addresses?.[0] || null,
                };

                set({ customer: updatedCustomer });
            },

            updateProfile: async (id: string, updates: Partial<Customer>) => {
                const { error } = await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', id);

                if (error) return false;

                const current = get().customer;
                if (current) {
                    set({ customer: { ...current, ...updates } });
                }
                return true;
            },
        }),
        {
            name: 'astra-auth',
            partialize: (state) => ({
                customer: state.customer,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
