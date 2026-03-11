import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ChevronLeft, Repeat, Calendar as CalendarIcon, Package, CheckCircle2, Clock } from 'lucide-react-native';

interface Subscription {
    id: string;
    product_name: string;
    frequency: string;
    quantity: number;
    status: string;
    start_date: string;
}

interface Order {
    id: string;
    delivery_date: string;
    status: string;
    total_amount: number;
}

export default function SubscriptionsScreen({ navigation }: any) {
    const { customer } = useAuthStore();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer?.id) {
            fetchData();
        }
    }, [customer?.id]);

    const fetchData = async () => {
        if (!customer?.id) return;
        try {
            const [subsRes, ordersRes] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('*, products(name)')
                    .eq('customer_id', customer.id),
                supabase
                    .from('orders')
                    .select('*')
                    .eq('customer_id', customer.id)
                    .order('delivery_date', { ascending: false })
                    .limit(10)
            ]);

            if (subsRes.data) {
                setSubscriptions(subsRes.data.map((s: any) => ({
                    ...s,
                    product_name: s.products?.name || 'Unknown Product'
                })));
            }
            if (ordersRes.data) setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error fetching subs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'paused': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
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
                    <Text className="text-white text-xl font-bold ml-2">Subscriptions</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D3E" className="mt-10" />
                ) : (
                    <View className="pb-12">
                        {/* Active Subscriptions */}
                        <View className="mb-8 ml-0">
                            <View className="flex-row items-center mb-4">
                                <Repeat size={20} color="#1B4D3E" />
                                <Text className="text-lg font-bold text-gray-900 ml-2">Active Plans</Text>
                            </View>

                            {subscriptions.length === 0 ? (
                                <View className="bg-white p-8 rounded-3xl border border-dashed border-gray-300 items-center">
                                    <Package size={48} color="#cbd5e1" />
                                    <Text className="text-gray-500 mt-4 text-center font-medium">No active subscriptions found.</Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Products')}
                                        className="mt-4"
                                    >
                                        <Text className="text-[#1B4D3E] font-bold">Browse Products</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                subscriptions.map((sub) => (
                                    <View key={sub.id} className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1">
                                                <Text className="font-bold text-gray-900 text-lg">{sub.product_name}</Text>
                                                <Text className="text-gray-500 mt-1 capitalize">{sub.frequency} Delivery</Text>
                                            </View>
                                            <View className={`px-3 py-1 rounded-full ${getStatusStyle(sub.status)}`}><Text className="text-[10px] font-bold uppercase">{sub.status}</Text></View>
                                        </View>
                                        <View className="flex-row items-center mt-4 pt-4 border-t border-gray-50">
                                            <View className="flex-row items-center mr-6">
                                                <Package size={16} color="#64748b" />
                                                <Text className="text-gray-600 ml-2 font-medium">Qty: {sub.quantity}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <CalendarIcon size={16} color="#64748b" />
                                                <Text className="text-gray-600 ml-2 font-medium">Starts: {sub.start_date}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>

                        {/* Recent Deliveries */}
                        <View>
                            <Text className="text-lg font-bold text-gray-900 mb-4">Recent Orders</Text>
                            {orders.length === 0 ? (
                                <Text className="text-gray-500 italic">No delivery history yet.</Text>
                            ) : (
                                orders.map((order) => (
                                    <View key={order.id} className="bg-white p-4 rounded-xl mb-3 flex-row items-center justify-between border border-gray-100">
                                        <View className="flex-row items-center">
                                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${order.status === 'delivered' ? 'bg-green-100' : 'bg-blue-100'
                                                }`}>
                                                {order.status === 'delivered' ? <CheckCircle2 size={20} color="#15803d" /> : <Clock size={20} color="#1d4ed8" />}
                                            </View>
                                            <View>
                                                <Text className="font-bold text-gray-900">{order.delivery_date}</Text>
                                                <Text className="text-xs text-gray-500">Order ID: #{order.id.slice(0, 8)}</Text>
                                            </View>
                                        </View>
                                        <Text className="font-bold text-[#1B4D3E]">₹{order.total_amount}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
