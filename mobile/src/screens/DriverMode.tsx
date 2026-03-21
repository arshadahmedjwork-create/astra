import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { Package, Navigation, CheckCircle, MapPin, List, LogOut } from 'lucide-react-native';
import * as Location from 'expo-location';
import { startBackgroundLocation, stopBackgroundLocation } from '../backgroundLocation';

export default function DriverMode({ navigation }: any) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tracking, setTracking] = useState(false);
    const [driverId, setDriverId] = useState<string | null>(null);

    const fetchAssignedOrders = async () => {
        // For simulation, we'll fetch orders with status 'get_to_deliver'
        const { data, error } = await supabase
            .from('orders')
            .select('*, customers(full_name, mobile, addresses(*))')
            .eq('status', 'get_to_deliver');

        if (data) setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAssignedOrders();
        // Mock driver identification (in a real app, this would be from auth)
        setDriverId('b7a6f23c-4d5e-6f7a-8b9c-0d1e2f3a4b5c'); 
    }, []);

    const startTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'Location permission is required for driver mode.');
            return;
        }

        setTracking(true);
        const started = await startBackgroundLocation(driverId);
        if (!started) setTracking(false);
    };

    const stopTracking = async () => {
        setTracking(false);
        await stopBackgroundLocation();
    };

    const handleDirections = (order: any) => {
        const addr = order.customers?.addresses?.[0];
        if (!addr) return;

        const url = `https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}&travelmode=driving`;
        Linking.openURL(url);
    };

    const handleDeliver = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', orderId);

        if (!error) {
            Alert.alert('Success', 'Order marked as delivered!');
            fetchAssignedOrders();
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator color="#1B4D3E" size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 pt-12">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100 bg-white">
                <View>
                    <Text className="text-2xl font-black text-[#1B4D3E]">Driver Mode</Text>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Active Shifts</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-3 bg-red-50 rounded-2xl"
                >
                    <LogOut color="#b91c1c" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {!tracking ? (
                    <View className="bg-[#1B4D3E] p-8 rounded-[32px] items-center shadow-xl mb-8">
                        <Navigation color="white" size={48} />
                        <Text className="text-white text-xl font-bold mt-4">Go Online</Text>
                        <Text className="text-white/70 text-center mt-2 mb-6">
                            Start sharing your location to receive orders and guide customers.
                        </Text>
                        <TouchableOpacity
                            onPress={startTracking}
                            className="bg-[#D4AF37] px-10 py-4 rounded-full"
                        >
                            <Text className="text-[#1B4D3E] font-black uppercase">Start Duty</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex-row items-center mb-6">
                        <View className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-3" />
                        <Text className="text-emerald-700 font-bold flex-1">Online & Tracking Location</Text>
                        <TouchableOpacity onPress={stopTracking}>
                            <Text className="text-emerald-700 text-xs font-bold underline">Go Offline</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
                    <List size={20} color="#1B4D3E" /> Assigned Orders ({orders.length})
                </Text>

                {orders.length === 0 ? (
                    <View className="items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100">
                        <Package size={48} color="#cbd5e1" />
                        <Text className="text-gray-400 mt-4">No pending deliveries</Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <View key={order.id} className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Customer</Text>
                                    <Text className="text-gray-900 font-bold text-lg">{order.customers?.full_name}</Text>
                                    <Text className="text-gray-500 text-sm">{order.customers?.address?.door_no}, {order.customers?.address?.street}</Text>
                                </View>
                                <View className="bg-[#1B4D3E]/10 px-3 py-1 rounded-full">
                                    <Text className="text-[#1B4D3E] text-[10px] font-bold uppercase tracking-widest">{order.id.slice(0,6)}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => handleDirections(order)}
                                    className="flex-1 bg-blue-50 h-14 rounded-2xl items-center justify-center flex-row"
                                >
                                    <Navigation color="#1d4ed8" size={20} />
                                    <Text className="text-[#1d4ed8] font-bold ml-2">Directions</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeliver(order.id)}
                                    className="flex-1 bg-[#1B4D3E] h-14 rounded-2xl items-center justify-center flex-row"
                                >
                                    <CheckCircle color="white" size={20} />
                                    <Text className="text-white font-bold ml-2">Delivered</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
