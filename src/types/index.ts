export interface Address {
    id: string;
    customer_id: string;
    door_no?: string;
    street?: string;
    area?: string;
    city?: string;
    pincode?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
}

export interface Customer {
    id: string;
    customer_id: string;
    full_name: string;
    mobile: string;
    created_at: string;
    address?: {
        door_no?: string;
        street?: string;
        area?: string;
        city?: string;
        pincode?: string;
        landmark?: string;
    };
}

export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
    is_sample: boolean;
    purchase_type?: 'daily' | 'subscription' | 'both';
    stock_quantity?: number;
    active: boolean;
}

// Supabase join shapes — the DB can return nested relations as partial objects
// or omit them entirely. Using typed union avoids the unsafe `any`.
type CustomerJoin = {
    full_name: string;
    mobile: string;
    customer_id: string;
} | null | undefined;

type ProductJoin = Partial<Product> | null | undefined;

export interface Order {
    id: string;
    customer_id: string;
    status: 'pending' | 'get_to_deliver' | 'delivered' | 'cancelled' | 'paused' | 'preparing';
    delivery_date: string;
    total_amount: number;
    is_confirmed: boolean;
    driver_id?: string;
    order_items?: OrderItem[];
    drivers?: Driver;
    created_at: string;
    customers?: CustomerJoin;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: { name: string } | null;
}

export interface Driver {
    id: string;
    full_name: string;
    phone: string;
    vehicle_no: string;
    status?: 'active' | 'inactive';
    current_lat?: number;
    current_lng?: number;
    tracking_active?: boolean;
}

export interface Subscription {
    id: string;
    customer_id: string;
    product_id: string;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    frequency: string;
    quantity: number;
    start_date: string;
    end_date?: string;
    total_price: number;
    created_at: string;
    products?: ProductJoin;
    customers?: CustomerJoin;
}

export interface Payment {
    id: string;
    transaction_id: string;
    customer_id: string;
    amount: number;
    mode: 'wallet' | 'upi' | 'card' | 'cod';
    status: 'completed' | 'failed' | 'pending' | 'refunded';
    payment_date: string;
    customers?: CustomerJoin;
}

export interface SampleRequest {
    id: string;
    customer_id: string;
    product_id: string;
    status: 'requested' | 'delivered' | 'cancelled';
    requested_at: string;
    customers?: {
        customer_id: string;
        full_name: string;
        mobile: string;
    };
    products?: {
        name: string;
        unit: string;
    };
}
