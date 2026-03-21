import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ChevronLeft, Package, Clock, CheckCircle2, XCircle, AlertCircle, Navigation } from 'lucide-react-native';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface Order {
    id: string;
    order_date: string;
    delivery_date: string;
    status: string;
    total_amount: number;
    created_at: string;
    order_items: any[];
}

export default function OrdersScreen({ navigation }: any) {
    const { customer } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!customer?.id) return;
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (name)
                    )
                `)
                .eq('customer_id', customer.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [customer?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleCancelOrder = async (orderId: string) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('orders')
                                .update({ status: 'cancelled' })
                                .eq('id', orderId);

                            if (error) throw error;
                            Alert.alert('Success', 'Order cancelled successfully');
                            fetchOrders();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to cancel order: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const isCancellable = (order: Order) => {
        if (order.status !== 'pending') return false;

        const createdAt = new Date(order.created_at).getTime();
        const now = new Date().getTime();
        const diffInMinutes = (now - createdAt) / (1000 * 60);

        return diffInMinutes < 10;
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'get_to_deliver': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock size={16} color="#b45309" />;
            case 'delivered': return <CheckCircle2 size={16} color="#15803d" />;
            case 'cancelled': return <XCircle size={16} color="#b91c1c" />;
            default: return <Package size={16} color="#475569" />;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-[#1B4D3E] pt-16 pb-6 px-6 rounded-b-[32px] shadow-lg">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-2">My Orders</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B4D3E']} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D3E" className="mt-10" />
                ) : orders.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Package size={64} color="#cbd5e1" />
                        <Text className="text-gray-500 mt-4 text-lg font-medium">No orders found</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Products')}
                            className="mt-6 bg-[#1B4D3E] px-8 py-3 rounded-full"
                        >
                            <Text className="text-white font-bold">Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="pb-10">
                        {orders.map((order) => (
                            <View key={order.id} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Order ID</Text>
                                        <Text className="text-gray-900 font-bold">#{order.id.slice(0, 8).toUpperCase()}</Text>
                                    </View>
                                    <View className={`flex-row items-center px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <Text className="ml-1.5 text-[10px] font-bold uppercase">{order.status.replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>

                                <View className="mb-4">
                                    {order.order_items?.map((item: any, idx: number) => (
                                        <View key={idx} className="flex-row justify-between mb-1">
                                            <Text className="text-gray-700 flex-1">{item.products?.name} x {item.quantity}</Text>
                                            <Text className="text-gray-900 font-medium">₹{item.unit_price * item.quantity}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View className="h-[1px] bg-gray-50 my-3" />

                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Delivery Date</Text>
                                        <Text className="text-gray-900 font-medium">{new Date(order.delivery_date).toLocaleDateString()}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total</Text>
                                        <Text className="text-[#1B4D3E] font-bold text-lg">₹{order.total_amount}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
                                    className="mt-4 bg-[#1B4D3E] py-4 rounded-xl items-center flex-row justify-center shadow-md shadow-[#1B4D3E]/20"
                                >
                                    <Navigation size={18} color="white" />
                                    <Text className="text-white font-bold ml-2 uppercase">Track Order</Text>
                                </TouchableOpacity>

                                {isCancellable(order) && (
                                    <TouchableOpacity
                                        onPress={() => handleCancelOrder(order.id)}
                                        className="mt-4 bg-red-50 border border-red-100 py-3 rounded-xl items-center flex-row justify-center"
                                    >
                                        <AlertCircle size={18} color="#b91c1c" />
                                        <Text className="text-red-700 font-bold ml-2">Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
