import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LogOut, Package, Repeat, User, ShoppingCart, Navigation, BellRing, CheckCircle } from 'lucide-react-native';
import { useCartStore } from '../stores/cartStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [showDailyPrompt, setShowDailyPrompt] = React.useState(false);

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
                    id: data.id,
                    productName: data.products?.name,
                    quantity: data.quantity,
                    status: data.status,
                    date: tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
                });
            }
        } catch (error) {
            console.log('Error fetching delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePause = async () => {
        if (!nextDelivery?.id) return;
        const newStatus = nextDelivery.status === 'paused' ? 'active' : 'paused';
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: newStatus })
                .eq('id', nextDelivery.id);
            
            if (error) throw error;
            
            setNextDelivery({ ...nextDelivery, status: newStatus });
            Alert.alert('Status Updated', `Your subscription is now ${newStatus}.`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    React.useEffect(() => {
        fetchNextDelivery();
        checkDailyPrompt();
    }, [customer?.id]);

    const checkDailyPrompt = async () => {
        try {
            const today = new Date().toDateString();
            const lastConfirmed = await AsyncStorage.getItem('astra_daily_confirmed');
            if (lastConfirmed !== today) {
                setShowDailyPrompt(true);
            }
        } catch (e) {
            console.log('Error checking daily prompt:', e);
        }
    };

    const handleDailyConfirm = async () => {
        try {
            const today = new Date().toDateString();
            await AsyncStorage.setItem('astra_daily_confirmed', today);
            setShowDailyPrompt(false);
        } catch (e) {
            console.log('Error saving daily confirm:', e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
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
                            <Text className="text-[#D4AF3E] font-mono text-lg font-bold mt-1">{customer?.customer_id}</Text>
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
                        {customer && (
                            <>
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
                            </>
                        )}
                    </View>

                    {customer && (
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
                    )}
                </View>

                {/* Profile Quick Access */}
                {customer && (
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
                )}

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
                        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-2xl items-center justify-center mr-4">
                                    <Package color="#1B4D3E" size={28} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">{nextDelivery.date}</Text>
                                    <Text className="text-gray-900 font-bold text-lg mt-1">{nextDelivery.productName}</Text>
                                    <Text className="text-[#1B4D3E] font-medium mt-1">Quantity: {nextDelivery.quantity}</Text>
                                </View>
                                <View className={`bg-${nextDelivery.status === 'paused' ? 'orange' : 'emerald'}-50 px-3 py-1 rounded-full`}>
                                    <Text className={`text-${nextDelivery.status === 'paused' ? 'orange' : 'emerald'}-700 text-[10px] font-bold uppercase`}>
                                        {nextDelivery.status || 'Scheduled'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row gap-2 mt-4">
                                <TouchableOpacity
                                    onPress={handleTogglePause}
                                    className={`flex-1 ${nextDelivery.status === 'paused' ? 'bg-[#1B4D3E]' : 'bg-orange-500'} py-3 rounded-xl items-center`}
                                >
                                    <Text className="text-white font-bold">
                                        {nextDelivery.status === 'paused' ? 'Resume' : 'Pause'} Deliveries
                                    </Text>
                                </TouchableOpacity>
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

            <Modal
                visible={showDailyPrompt}
                transparent={true}
                animationType="fade"
            >
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View className="bg-white rounded-[40px] p-8 w-full items-center shadow-2xl">
                        <View className="w-20 h-20 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-6">
                            <BellRing color="#1B4D3E" size={40} />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 text-center">Daily Confirmation</Text>
                        <Text className="text-gray-500 text-center mt-2 mb-8 leading-5">
                            Please confirm your delivery for today to ensure everything is on track!
                        </Text>
                        <TouchableOpacity
                            onPress={handleDailyConfirm}
                            className="bg-[#1B4D3E] w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-[#1B4D3E]/20"
                        >
                            <CheckCircle color="white" size={20} />
                            <Text className="text-white font-bold ml-2 text-lg">Confirm Today's Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
