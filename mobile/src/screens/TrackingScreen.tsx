import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, ImageSourcePropType } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { ChevronLeft, Phone, Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import driverImg from '../../assets/driver.png';

interface RouteParams {
    orderId: string;
}

interface NavigationProp {
    goBack: () => void;
}

interface TrackingScreenProps {
    route: { params: RouteParams };
    navigation: NavigationProp;
}

interface OrderData {
    id: string;
    driver_id?: string;
    drivers?: {
        full_name: string;
        vehicle_no: string;
        current_lat?: number;
        current_lng?: number;
    };
    customers?: {
        addresses?: { lat?: number; lng?: number; door_no?: string; street?: string }[];
    };
}

export default function TrackingScreen({ route, navigation }: TrackingScreenProps) {
    const { orderId } = route.params;
    const [order, setOrder] = useState<OrderData | null>(null);
    const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
    const [customerLocation, setCustomerLocation] = useState<LatLng | null>(null);
    const [loading, setLoading] = useState(true);
    const [eta, setEta] = useState('Calculating...');
    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const mapRef = React.useRef<MapView>(null);

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
            if (data.drivers && data.drivers.current_lat && data.drivers.current_lng) {
                setDriverLocation({
                    latitude: data.drivers.current_lat,
                    longitude: data.drivers.current_lng,
                });
            }
        }
        setLoading(false);
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchOSRMRoute = async (start: LatLng, end: LatLng) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const coords: LatLng[] = data.routes[0].geometry.coordinates.map((c: number[]) => ({
                    latitude: c[1],
                    longitude: c[0]
                }));
                setRouteCoords(coords);
                
                // Update ETA based on OSRM distance (in meters)
                const distanceKm = data.routes[0].distance / 1000;
                const mins = Math.max(1, Math.round(distanceKm * 4)); // 4 mins per km for city traffic
                setEta(`${mins} min${mins > 1 ? 's' : ''}`);
            }
        } catch (e) {
            console.error('Error fetching OSRM route:', e);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (!order?.driver_id) return;

        // Subscribe to driver location updates
        const channel = supabase
            .channel(`order-tracking-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'drivers',
                filter: `id=eq.${order.driver_id}`,
            }, (payload) => {
                if (payload.new.current_lat && payload.new.current_lng) {
                    const newLoc = {
                        latitude: payload.new.current_lat,
                        longitude: payload.new.current_lng,
                    };
                    setDriverLocation(newLoc);
                    
                    if (customerLocation) {
                        fetchOSRMRoute(newLoc, customerLocation);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [order?.driver_id, customerLocation]);

    useEffect(() => {
        if (driverLocation && customerLocation && routeCoords.length === 0) {
            fetchOSRMRoute(driverLocation, customerLocation);
        }
    }, [driverLocation, customerLocation]);

    useEffect(() => {
        if (driverLocation && customerLocation && mapRef.current) {
            mapRef.current.fitToCoordinates([driverLocation, customerLocation, ...routeCoords], {
                edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                animated: true,
            });
        }
    }, [driverLocation, customerLocation, routeCoords]);

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
                ref={mapRef}
                className="flex-1"
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: driverLocation?.latitude || customerLocation?.latitude || 13.0827,
                    longitude: driverLocation?.longitude || customerLocation?.longitude || 80.2707,
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
                        <Image source={driverImg} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
                    </Marker>
                )}
                {routeCoords.length > 0 ? (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                        strokeColor="#1B4D3E"
                        lineDashPattern={[1]}
                    />
                ) : driverLocation && customerLocation && (
                    <Polyline
                        coordinates={[driverLocation, customerLocation]}
                        strokeWidth={2}
                        strokeColor="#1B4D3E"
                        lineDashPattern={[5, 5]}
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
                        <Text className="text-[#1B4D3E] font-bold">Track Order #{orderId?.toString().slice(0, 8).toUpperCase() || 'N/A'}</Text>
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
                            <Text className="text-gray-900 text-lg font-bold">{eta}</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="bg-[#1B4D3E] p-4 rounded-full shadow-md">
                        <Phone color="white" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="h-[1px] bg-gray-100 my-4" />

                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-[#1B4D3E]/10 rounded-full items-center justify-center mr-3 overflow-hidden border border-[#D4AF37]">
                        <Image source={driverImg} style={{ width: 32, height: 32, resizeMode: 'contain' }} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-900 font-bold">{order?.drivers?.full_name || 'Delivery Partner'}</Text>
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">{order?.drivers?.vehicle_no || 'TVS XL 100'}</Text>
                    </View>
                    <View className="bg-emerald-50 px-3 py-1 rounded-full">
                        <Text className="text-emerald-700 text-[10px] font-bold">Verified</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
