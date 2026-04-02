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
    wallet_balance?: number;
    assigned_driver_id?: string;
}

interface Driver {
    id: string;
    full_name: string;
    phone: string;
    vehicle_no: string;
    status: string;
    current_lat?: number;
    current_lng?: number;
}

interface AuthState {
    customer: Customer | null;
    driver: Driver | null;
    isAuthenticated: boolean;
    setAuth: (session: any, user: Customer | null, driver: Driver | null) => void;
    updateCustomer: (customer: Customer) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            customer: null,
            driver: null,
            isAuthenticated: false,
            setAuth: (session, customer, driver) => {
                const formattedCustomer = customer ? {
                    ...customer,
                    address: Array.isArray(customer.address) ? customer.address[0] : customer.address
                } : null;
                set({ customer: formattedCustomer, driver: driver, isAuthenticated: true });
            },
            updateCustomer: (customer) => {
                set({ customer });
            },
            logout: async () => {
                await supabase.auth.signOut();
                set({ customer: null, driver: null, isAuthenticated: false });
            },
            checkSession: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    set({ customer: null, driver: null, isAuthenticated: false });
                    return;
                }

                if (session?.user?.phone) {
                    const phone = session.user.phone;
                    const phoneRaw = phone.startsWith('+91') ? phone.slice(3) : phone;

                    // Check both tables
                    const [customerRes, driverRes] = await Promise.all([
                        supabase.from('customers').select('*, address:addresses(*)').or(`mobile.eq.${phone},mobile.eq.${phoneRaw}`).single(),
                        supabase.from('drivers').select('*').or(`phone.eq.${phone},phone.eq.${phoneRaw}`).single()
                    ]);

                    let formattedCustomer = null;
                    if (customerRes.data) {
                        formattedCustomer = {
                            ...customerRes.data,
                            address: Array.isArray(customerRes.data.address) ? customerRes.data.address[0] : customerRes.data.address
                        };
                    }

                    if (formattedCustomer || driverRes.data) {
                        set({ 
                            customer: formattedCustomer, 
                            driver: driverRes.data || null, 
                            isAuthenticated: true 
                        });
                        return;
                    }
                }

                set({ customer: null, driver: null, isAuthenticated: false });
            },

            refreshProfile: async () => {
                const { customer } = get();
                if (!customer?.id) return;

                const { data: customerData, error } = await supabase
                    .from('customers')
                    .select('*, address:addresses(*)')
                    .eq('id', customer.id)
                    .single();

                if (error || !customerData) return;

                const formattedCustomer = {
                    ...customerData,
                    address: Array.isArray(customerData.address) ? customerData.address[0] : customerData.address
                };

                set({ customer: formattedCustomer });
            }
        }),
        {
            name: 'astra-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
