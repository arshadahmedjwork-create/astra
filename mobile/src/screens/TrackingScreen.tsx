import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChevronLeft, Phone, Clock, Navigation } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function TrackingScreen({ route, navigation }: any) {
    const { orderId } = route.params;
    const [order, setOrder] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<any>(null);
    const [customerLocation, setCustomerLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                customers (
                    addresses (lat, lng, door_no, street)
                ),
                drivers (*)
            `)
            .eq('id', orderId)
            .single();

        if (data) {
            setOrder(data);
            const addr = data.customers?.addresses?.[0];
            if (addr) {
                setCustomerLocation({
                    latitude: addr.lat || 13.0827,
                    longitude: addr.lng || 80.2707,
                });
            }
            if (data.drivers) {
                setDriverLocation({
                    latitude: data.drivers.current_lat,
                    longitude: data.drivers.current_lng,
                });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrderDetails();

        // Subscribe to driver location updates
        const channel = supabase
            .channel(`order-tracking-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'drivers',
                filter: order?.driver_id ? `id=eq.${order.driver_id}` : undefined,
            }, (payload) => {
                setDriverLocation({
                    latitude: payload.new.current_lat,
                    longitude: payload.new.current_lng,
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, order?.driver_id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator color="#1B4D3E" size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <MapView
                className="flex-1"
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    ...(driverLocation || customerLocation || { latitude: 13.0827, longitude: 80.2707 }),
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {customerLocation && (
                    <Marker
                        coordinate={customerLocation}
                        title="Delivery Location"
                        pinColor="#1B4D3E"
                    />
                )}
                {driverLocation && (
                    <Marker
                        coordinate={driverLocation}
                        title="Delivery Partner"
                    >
                        <View className="bg-white p-2 rounded-full border-2 border-[#D4AF37] shadow-lg">
                            <Navigation size={20} color="#D4AF37" />
                        </View>
                    </Marker>
                )}
                {driverLocation && customerLocation && (
                    <Polyline
                        coordinates={[driverLocation, customerLocation]}
                        strokeWidth={3}
                        strokeColor="#1B4D3E"
                    />
                )}
            </MapView>

            {/* Header overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-white p-2 rounded-full shadow-lg"
                    >
                        <ChevronLeft color="#1B4D3E" size={24} />
                    </TouchableOpacity>
                    <View className="ml-4 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                        <Text className="text-[#1B4D3E] font-bold">Track Order #{orderId.slice(0, 8).toUpperCase()}</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Bottom Sheet UI */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 shadow-2xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-4">
                            <Clock color="#1B4D3E" size={24} />
                        </View>
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase">Estimated Arrival</Text>
                            <Text className="text-gray-900 text-lg font-bold">12 - 15 Mins</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="bg-[#1B4D3E] p-4 rounded-full shadow-md">
                        <Phone color="white" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="h-[1px] bg-gray-100 my-4" />

                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                        <Navigation color="#475569" size={20} />
                    </View>
                    <Text className="text-gray-600 flex-1">
                        Your delivery partner is on the way to your address.
                    </Text>
                </View>
            </View>
        </View>
    );
}
