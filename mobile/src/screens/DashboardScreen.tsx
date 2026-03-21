import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LogOut, Package, Repeat, User, ShoppingCart, Navigation } from 'lucide-react-native';
import { useCartStore } from '../stores/cartStore';

export default function DashboardScreen({ navigation }: any) {
    const { customer, driver, logout } = useAuthStore();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => await logout()
            }
        ]);
    };

    const [nextDelivery, setNextDelivery] = React.useState<any>(null);
    const [activeOrder, setActiveOrder] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchNextDelivery = async () => {
        if (!customer?.id) return;
        try {
            const { data } = await supabase
                .from('subscriptions')
                .select('*, products(*)')
                .eq('customer_id', customer.id)
                .eq('status', 'active')
                .limit(1)
                .single();

            if (data) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(now.getDate() + 1);
                tomorrow.setHours(5, 0, 0, 0);

                setNextDelivery({
                    productName: data.products?.name,
                    quantity: data.quantity,
                    date: tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
                });
            }

            const { data: activeOrderData } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id)
                .eq('status', 'get_to_deliver')
                .limit(1)
                .single();
            
            if (activeOrderData) setActiveOrder(activeOrderData);
        } catch (error) {
            console.log('Error fetching delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNextDelivery();
    }, [customer?.id]);

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-[#1B4D3E] pt-16 pb-6 px-6 rounded-b-[32px] shadow-lg">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white/80 text-sm font-medium">Welcome back,</Text>
                        <Text className="text-white text-2xl font-bold mt-1">{customer?.full_name || driver?.full_name || 'User'}</Text>
                        {driver && !customer && <Text className="text-[#D4AF37] text-xs font-bold uppercase mt-1">Delivery Partner</Text>}
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Cart')}
                            className="bg-white/10 p-3 rounded-xl border border-white/20 relative"
                        >
                            <ShoppingCart color="white" size={20} />
                            {useCartStore.getState().items.length > 0 && (
                                <View className="absolute -top-1 -right-1 bg-[#D4AF37] min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
                                    <Text className="text-[10px] font-bold text-[#1B4D3E]">{useCartStore.getState().items.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-white/10 p-3 rounded-xl border border-white/20"
                        >
                            <LogOut color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {customer ? (
                    <View className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20">
                        <Text className="text-white/80 text-sm">Customer ID</Text>
                        <Text className="text-[#D4AF37] font-mono text-lg font-bold mt-1">{customer?.customer_id}</Text>
                    </View>
                ) : driver ? (
                    <View className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20">
                        <Text className="text-white/80 text-sm">Vehicle Number</Text>
                        <Text className="text-[#D4AF37] font-mono text-lg font-bold mt-1">{driver?.vehicle_no}</Text>
                    </View>
                ) : null}
            </View>

            {/* Quick Actions */}
            <View className="px-6 mt-8">
                <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>

                <View className="flex-row justify-between gap-4">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Products')}
                        className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 items-center"
                    >
                        <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-3">
                            <Package color="#1B4D3E" size={28} />
                        </View>
                        <Text className="font-bold text-gray-900 text-center">Buy Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Subscriptions')}
                        className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 items-center"
                    >
                        <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-3">
                            <Repeat color="#1B4D3E" size={28} />
                        </View>
                        <Text className="font-bold text-gray-900 text-center">Subscriptions</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Orders')}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex-row items-center mt-4"
                >
                    <View className="w-12 h-12 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-4">
                        <Package color="#1B4D3E" size={24} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg">My Orders</Text>
                        <Text className="text-gray-500 text-xs mt-0.5">View and track your previous orders</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Profile Quick Access */}
            <View className="px-6 mt-6">
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex-row items-center"
                >
                    <View className="w-12 h-12 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-4">
                        <User color="#1B4D3E" size={24} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg">My Profile</Text>
                        <Text className="text-gray-500 text-xs mt-0.5">Manage your personal information</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Driver Mode Access - Only for registered drivers */}
            {driver && (
                <View className="px-6 mt-6">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Driver')}
                        className="bg-[#1B4D3E]/5 p-5 rounded-3xl border border-[#1B4D3E]/10 flex-row items-center"
                    >
                        <View className="w-12 h-12 bg-[#1B4D3E] rounded-full items-center justify-center mr-4">
                            <Navigation color="white" size={24} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-[#1B4D3E] text-lg">Driver Dashboard</Text>
                            <Text className="text-[#1B4D3E]/60 text-xs mt-0.5">Manage and deliver assigned orders</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Active Delivery Tracking */}
            {activeOrder && (
                <View className="px-6 mt-6">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Tracking', { orderId: activeOrder.id })}
                        className="bg-[#1B4D3E] p-6 rounded-[32px] shadow-lg shadow-primary/30 flex-row items-center overflow-hidden"
                    >
                        <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4">
                            <Navigation color="white" size={32} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white/80 text-xs font-bold uppercase tracking-widest">Out for Delivery</Text>
                            <Text className="text-white font-black text-xl">Track Live Order</Text>
                            <Text className="text-white/70 text-xs mt-1">Partner is on the way!</Text>
                        </View>
                        <View className="bg-white p-3 rounded-full">
                            <Navigation color="#1B4D3E" size={20} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Next Delivery Section */}
            <View className="px-6 mt-8 mb-8">
                <Text className="text-xl font-bold text-gray-900 mb-4">Next Delivery</Text>
                {loading ? (
                    <View className="bg-white p-10 rounded-3xl items-center justify-center border border-gray-100">
                        <ActivityIndicator color="#1B4D3E" />
                    </View>
                ) : nextDelivery ? (
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-row items-center">
                        <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-2xl items-center justify-center mr-4">
                            <Package color="#1B4D3E" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">{nextDelivery.date}</Text>
                            <Text className="text-gray-900 font-bold text-lg mt-1">{nextDelivery.productName}</Text>
                            <Text className="text-[#1B4D3E] font-medium mt-1">Quantity: {nextDelivery.quantity}</Text>
                        </View>
                        <View className="bg-emerald-50 px-3 py-1 rounded-full">
                            <Text className="text-emerald-700 text-[10px] font-bold uppercase">Scheduled</Text>
                        </View>
                    </View>
                ) : (
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-center py-4 font-medium">
                            No active subscriptions found.
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Products')}
                            className="bg-[#1B4D3E] py-3 rounded-xl mt-2 items-center"
                        >
                            <Text className="text-white font-bold">Start a Subscription</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
