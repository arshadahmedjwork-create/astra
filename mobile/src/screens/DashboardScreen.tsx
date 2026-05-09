import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, SafeAreaView, Animated, Easing, Platform, StatusBar } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LogOut, Package, Repeat, User, ShoppingCart, Navigation, BellRing, CheckCircle, Wallet, CreditCard } from 'lucide-react-native';
import { useCartStore } from '../stores/cartStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Marquee = () => {
    const scrollX = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const startAnimation = () => {
            scrollX.setValue(300);
            Animated.timing(scrollX, {
                toValue: -300,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => startAnimation());
        };
        startAnimation();
    }, []);

    const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
    
    return (
        <View style={{ 
            backgroundColor: '#FEF3C7', 
            paddingTop: paddingTop,
            paddingVertical: 6, 
            borderBottomWidth: 1, 
            borderBottomColor: '#FDE68A', 
            overflow: 'hidden' 
        }}>
            <Animated.Text
                style={{
                    transform: [{ translateX: scrollX }],
                    color: '#92400E',
                    fontSize: 10,
                    fontWeight: 'bold',
                    width: 600,
                    textAlign: 'center'
                }}
            >
                Next day Delivery cutoff time is 7PM • Order before 7PM for tomorrow's delivery • Next day Delivery cutoff time is 7PM
            </Animated.Text>
        </View>
    );
};

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
    const [driverStats, setDriverStats] = React.useState<any>({ pending: 0, completed: 0 });
    const [loading, setLoading] = React.useState(true);
    const [showDailyPrompt, setShowDailyPrompt] = React.useState(false);
    const [todayOrder, setTodayOrder] = React.useState<any>(null);
    const [actionLoading, setActionLoading] = React.useState(false);

    const fetchActiveOrder = async () => {
        if (!customer?.id) return;
        try {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id)
                .in('status', ['preparing', 'get_to_deliver'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (data) setActiveOrder(data);
            else setActiveOrder(null);
        } catch (e) {
            console.log('Error fetching active order:', e);
        }
    };

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

    const fetchDriverStats = async () => {
        if (!driver?.id) return;
        try {
            const { data: pendingData } = await supabase
                .from('orders')
                .select('id')
                .eq('driver_id', driver.id)
                .in('status', ['preparing', 'get_to_deliver']);
            
            const { data: completedData } = await supabase
                .from('orders')
                .select('id')
                .eq('driver_id', driver.id)
                .eq('status', 'delivered')
                .gte('updated_at', new Date().toISOString().split('T')[0]);

            setDriverStats({
                pending: pendingData?.length || 0,
                completed: completedData?.length || 0
            });
        } catch (e) {
            console.log('Error fetching driver stats:', e);
        }
    };

    React.useEffect(() => {
        fetchNextDelivery();
        fetchActiveOrder();
        if (driver) fetchDriverStats();
        checkDailyPrompt();
    }, [customer?.id, driver?.id]);

    const checkDailyPrompt = async () => {
        if (!customer?.id) return;
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id)
                .eq('delivery_date', todayStr)
                .maybeSingle();

            if (data && !data.is_confirmed && data.status !== 'cancelled' && data.status !== 'delivered') {
                setTodayOrder(data);
                setShowDailyPrompt(true);
            }
        } catch (e) {
            console.log('Error checking daily prompt:', e);
        }
    };

    const handleDailyAction = async (skip = false) => {
        if (!todayOrder?.id) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ 
                    is_confirmed: !skip,
                    status: skip ? 'cancelled' : 'pending' 
                })
                .eq('id', todayOrder.id);
            
            if (error) throw error;
            
            setShowDailyPrompt(false);
            Alert.alert(skip ? 'Skipped' : 'Confirmed', skip ? "You've skipped today's delivery." : "Thank you! We're on the way.");
            fetchActiveOrder(); // Refresh dashboard
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Marquee />
            <ScrollView className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="bg-[#1B4D3E] pt-16 pb-6 px-6 rounded-b-[32px] shadow-lg">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-4">
                            <Text className="text-white/80 text-sm font-medium">Welcome back,</Text>
                            <Text className="text-white text-2xl font-bold mt-1" numberOfLines={1} ellipsizeMode="tail">{customer?.full_name || driver?.full_name || 'User'}</Text>
                            {driver && !customer && <Text className="text-[#D4AF37] text-xs font-bold uppercase mt-1">Delivery Partner</Text>}
                        </View>
                        <View className="flex-row gap-2">
                            {customer && (
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
                            )}
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

                {/* Wallet Balance Card (Mobile Quick View) */}
                {customer && (
                    <View className="px-6 -mt-6">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Wallet')}
                            className="bg-white p-6 rounded-[32px] shadow-xl shadow-[#1B4D3E]/10 border border-gray-100 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-[#1B4D3E]/5 rounded-2xl items-center justify-center mr-4">
                                    <Wallet color="#1B4D3E" size={28} />
                                </View>
                                <View>
                                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Wallet Balance</Text>
                                    <Text className="text-2xl font-black text-gray-900 mt-1">₹{customer?.wallet_balance?.toLocaleString() || '0.00'}</Text>
                                </View>
                            </View>
                            <View className="bg-[#1B4D3E] p-3 rounded-2xl shadow-md">
                                <CreditCard color="white" size={20} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Actions */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>

                    {customer && (
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Products')}
                                className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 items-center justify-center min-h-[140px]"
                            >
                                <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-4">
                                    <Package color="#1B4D3E" size={28} />
                                </View>
                                <Text className="font-bold text-gray-900 text-center text-sm px-1" numberOfLines={2}>Buy Products</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('Subscriptions')}
                                className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 items-center justify-center min-h-[140px]"
                            >
                                <View className="w-14 h-14 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-4">
                                    <Repeat color="#1B4D3E" size={28} />
                                </View>
                                <Text className="font-bold text-gray-900 text-center text-sm px-1" numberOfLines={2}>Subscriptions</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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

                {/* Driver Operational Dashboard - Premium View */}
                {driver && (
                    <View className="px-6 mt-6">
                        <View className="bg-white p-6 rounded-[40px] shadow-2xl shadow-[#1B4D3E]/20 border border-gray-100 overflow-hidden">
                            <View className="flex-row justify-between items-center mb-6">
                                <View className="flex-1">
                                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-[2px]">Today's Shift</Text>
                                    <Text className="text-2xl font-black text-gray-900 mt-1" numberOfLines={1}>Operational View</Text>
                                </View>
                                <View className="bg-emerald-50 px-3 py-1 rounded-full flex-row items-center ml-2">
                                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                                    <Text className="text-emerald-700 text-[10px] font-bold uppercase">Online</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-4 mb-8">
                                <View className="flex-1 bg-[#1B4D3E]/5 p-5 rounded-3xl border border-[#1B4D3E]/10">
                                    <View className="w-10 h-10 bg-[#1B4D3E] rounded-2xl items-center justify-center mb-3">
                                        <Package color="white" size={20} />
                                    </View>
                                    <Text className="text-[#1B4D3E] text-2xl font-black">{driverStats.pending}</Text>
                                    <Text className="text-[#1B4D3E]/60 text-[10px] font-bold uppercase mt-1">Pending Orders</Text>
                                </View>
                                <View className="flex-1 bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
                                    <View className="w-10 h-10 bg-emerald-500 rounded-2xl items-center justify-center mb-3">
                                        <CheckCircle color="white" size={20} />
                                    </View>
                                    <Text className="text-emerald-700 text-2xl font-black">{driverStats.completed}</Text>
                                    <Text className="text-emerald-700/60 text-[10px] font-bold uppercase mt-1">Delivered Today</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('Driver')}
                                className="bg-[#1B4D3E] p-6 rounded-[28px] flex-row items-center justify-center shadow-xl shadow-[#1B4D3E]/30"
                            >
                                <Navigation color="white" size={24} />
                                <Text className="text-white font-black text-lg ml-3">Enter Driver Dashboard</Text>
                            </TouchableOpacity>

                            {/* Next Task Preview Snippet */}
                            {driverStats.pending > 0 && (
                                <View className="mt-6 pt-6 border-t border-gray-100">
                                    <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-[2px] mb-3 text-center">Upcoming Task</Text>
                                    <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 shadow-sm">
                                            <Package color="#1B4D3E" size={20} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-sm">Priority Delivery</Text>
                                            <Text className="text-gray-500 text-[10px] mt-0.5">Check dashboard for details</Text>
                                        </View>
                                        <Navigation color="#1B4D3E" size={16} />
                                    </View>
                                </View>
                            )}
                        </View>
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
                                <Text className="text-white font-bold">Buy Products</Text>
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
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                    <View className="bg-white rounded-[40px] p-8 w-full items-center shadow-2xl">
                        <View className="w-20 h-20 bg-[#1B4D3E]/10 rounded-full items-center justify-center mb-6">
                            <BellRing color="#1B4D3E" size={40} />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 text-center">Daily Confirmation</Text>
                        <Text className="text-gray-500 text-center mt-2 mb-8 leading-5">
                            Please confirm your delivery for today to ensure everything is on track!
                        </Text>
                        
                        <View className="w-full gap-3">
                            <TouchableOpacity
                                onPress={() => handleDailyAction(false)}
                                disabled={actionLoading}
                                className="bg-[#1B4D3E] w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-[#1B4D3E]/20"
                            >
                                {actionLoading ? <ActivityIndicator color="white" size="small" /> : <CheckCircle color="white" size={20} />}
                                <Text className="text-white font-bold ml-2 text-lg">Confirm Today's Order</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDailyAction(true)}
                                disabled={actionLoading}
                                className="w-full py-4 rounded-2xl flex-row items-center justify-center border border-gray-200"
                            >
                                <Text className="text-gray-500 font-bold text-base">I don't need today's delivery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
