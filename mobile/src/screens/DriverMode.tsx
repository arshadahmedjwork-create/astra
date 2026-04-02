/**
 * DriverMode.tsx
 * ──────────────────────────────────────────────────────────────────
 * Enhanced driver delivery screen with:
 *  • Nearest-Neighbour route optimization (via routeOptimizer)
 *  • MapView showing stops + road polyline
 *  • List/Map tab toggle
 *  • "Next Best Delivery" hero card
 *  • Auto re-optimize after each delivery completion
 *  • Real-time Supabase subscription for new order assignments
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, SafeAreaView,
    ActivityIndicator, Alert, Linking, Dimensions, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { startBackgroundLocation, stopBackgroundLocation } from '../backgroundLocation';
import {
    Package, Navigation, CheckCircle, MapPin, List, Map,
    LogOut, ShieldAlert, Zap, Clock, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react-native';
import {
    optimizeDeliveryRoute,
    type DeliveryStop,
    type LatLng as GeoCoord,
    type OptimizationResult,
} from '../lib/routeOptimizer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Colour helpers ────────────────────────────────────────────────────────────

const STOP_COLORS = ['#16a34a', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];
function stopColor(idx: number) { return STOP_COLORS[idx % STOP_COLORS.length]; }

// ─── Component ────────────────────────────────────────────────────────────────

export default function DriverMode({ navigation }: any) {
    const { driver } = useAuthStore();

    // Orders & route state
    const [orders,          setOrders]          = useState<any[]>([]);
    const [result,          setResult]          = useState<OptimizationResult | null>(null);
    const [optimizing,      setOptimizing]      = useState(false);
    const [loading,         setLoading]         = useState(true);

    // Location / tracking
    const [tracking,        setTracking]        = useState(false);
    const [driverLatLng,    setDriverLatLng]    = useState<GeoCoord | null>(null);

    // UI
    const [viewMode,        setViewMode]        = useState<'list' | 'map'>('list');
    const [expandedId,      setExpandedId]      = useState<string | null>(null);

    const mapRef = useRef<MapView>(null);

    // ── Fetch orders ────────────────────────────────────────────────────────
    const fetchAssignedOrders = useCallback(async () => {
        if (!driver?.id) return;
        const { data } = await supabase
            .from('orders')
            .select('*, customers(id, full_name, mobile, addresses(*))')
            .eq('driver_id', driver.id)
            .in('status', ['pending', 'preparing', 'get_to_deliver']);

        if (data) {
            setOrders(data);
            setLoading(false);
        }
    }, [driver?.id]);

    useEffect(() => {
        fetchAssignedOrders();

        if (!driver?.id) return;
        const channel = supabase
            .channel(`driver-orders-${driver.id}`)
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'orders',
                filter: `driver_id=eq.${driver.id}`,
            }, fetchAssignedOrders)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [driver?.id, fetchAssignedOrders]);

    // ── Location permission & tracking ──────────────────────────────────────
    const requestLocation = async (): Promise<GeoCoord | null> => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is required for route optimization.');
            return null;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    };

    const startTracking = async () => {
        const loc = await requestLocation();
        if (!loc) return;
        setDriverLatLng(loc);
        setTracking(true);
        if (driver?.id) await startBackgroundLocation(driver.id);
    };

    const stopTracking = async () => {
        setTracking(false);
        await stopBackgroundLocation();
    };

    // ── Route optimisation ──────────────────────────────────────────────────
    const handleOptimizeRoute = async (currentOrders?: any[]) => {
        const ordersToOptimize = currentOrders ?? orders;
        if (ordersToOptimize.length === 0) return;

        setOptimizing(true);
        try {
            let loc = driverLatLng;
            if (!loc) {
                loc = await requestLocation();
                if (loc) setDriverLatLng(loc);
            }
            if (!loc) { setOptimizing(false); return; }

            const res = await optimizeDeliveryRoute(loc, ordersToOptimize);
            setResult(res);

            // Fit map to show all stops
            if (mapRef.current && res.sorted.length > 0) {
                mapRef.current.fitToCoordinates(
                    [
                        { latitude: loc.lat, longitude: loc.lng },
                        ...res.sorted.map(s => ({ latitude: s.lat, longitude: s.lng })),
                    ],
                    { edgePadding: { top: 60, right: 40, bottom: 60, left: 40 }, animated: true },
                );
            }
        } catch (e: any) {
            Alert.alert('Optimization Error', e.message || 'Could not optimize route.');
        } finally {
            setOptimizing(false);
        }
    };

    // ── Mark as delivered → re-optimize ────────────────────────────────────
    const handleDeliver = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered', tracking_active: false })
            .eq('id', orderId);

        if (error) { Alert.alert('Error', error.message); return; }

        // Refresh orders then re-optimize from current location
        const { data } = await supabase
            .from('orders')
            .select('*, customers(id, full_name, mobile, addresses(*))')
            .eq('driver_id', driver?.id)
            .in('status', ['pending', 'preparing', 'get_to_deliver']);

        const remaining = data ?? [];
        setOrders(remaining);

        // Update driver location then re-optimize
        const loc = await requestLocation();
        if (loc) setDriverLatLng(loc);

        if (remaining.length > 0 && (loc || driverLatLng)) {
            await handleOptimizeRoute(remaining);
        } else {
            setResult(prev => prev ? { ...prev, sorted: prev.sorted.filter(s => s.orderId !== orderId) } : null);
        }
    };

    const handleStartDelivery = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'get_to_deliver', tracking_active: true })
            .eq('id', orderId);
        if (!error) fetchAssignedOrders();
    };

    const handleOpenMaps = (stop: DeliveryStop) => {
        const label = encodeURIComponent(stop.customerName);
        const url = Platform.select({
            ios:     `maps://maps.apple.com/?q=${label}&ll=${stop.lat},${stop.lng}&dirflg=d`,
            android: `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving`,
        });
        if (url) Linking.openURL(url);
    };

    // ── Derived display list ────────────────────────────────────────────────
    // If optimized: use sorted result. Otherwise: raw orders.
    const displayStops: DeliveryStop[] = result?.sorted ?? orders.map((o, i) => {
        const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers;
        const addr = cust?.addresses?.[0] ?? {};
        return {
            orderId:      o.id,
            customerName: cust?.full_name ?? 'Unknown',
            addressText:  [addr?.door_no, addr?.street, addr?.area, addr?.city].filter(Boolean).join(', ') || 'No address',
            lat:          parseFloat(addr?.lat) || 0,
            lng:          parseFloat(addr?.lng) || 0,
            totalAmount:  o.total_amount ?? 0,
            status:       o.status,
            raw:          o,
        };
    });

    const nextStop = displayStops[0] ?? null;

    // ── Guards ──────────────────────────────────────────────────────────────
    if (!driver) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <ShieldAlert color="#b91c1c" size={64} />
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', marginTop: 20, textAlign: 'center' }}>Unauthorized</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
                    Please log in as a delivery partner.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={{ backgroundColor: '#1B4D3E', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 32, width: '100%' }}
                >
                    <Text style={{ color: 'white', fontWeight: '900', textAlign: 'center' }}>Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator color="#1B4D3E" size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <View style={{
                backgroundColor: '#1B4D3E', paddingTop: 16, paddingBottom: 16,
                paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <View>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>Driver Mode</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>
                        {driver.full_name}  ·  {displayStops.length} stops
                        {result ? `  ·  ${result.totalRouteKm} km` : ''}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* List / Map toggle */}
                    <TouchableOpacity
                        onPress={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12 }}
                    >
                        {viewMode === 'list'
                            ? <Map color="white" size={20} />
                            : <List color="white" size={20} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ backgroundColor: '#dc2626', padding: 10, borderRadius: 12 }}
                    >
                        <LogOut color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Tracking + Optimize bar ─────────────────────────────────── */}
            <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 10 }}>
                {/* Duty toggle */}
                <TouchableOpacity
                    onPress={tracking ? stopTracking : startTracking}
                    style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        paddingVertical: 10, borderRadius: 14,
                        backgroundColor: tracking ? '#dcfce7' : '#f1f5f9',
                        borderWidth: 1, borderColor: tracking ? '#86efac' : '#e5e7eb',
                    }}
                >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tracking ? '#16a34a' : '#9ca3af' }} />
                    <Text style={{ fontWeight: '800', fontSize: 12, color: tracking ? '#15803d' : '#6b7280' }}>
                        {tracking ? 'On Duty' : 'Start Duty'}
                    </Text>
                </TouchableOpacity>

                {/* Optimize button */}
                <TouchableOpacity
                    onPress={() => handleOptimizeRoute()}
                    disabled={optimizing || orders.length === 0}
                    style={{
                        flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        paddingVertical: 10, borderRadius: 14,
                        backgroundColor: optimizing ? '#f3f4f6' : '#1B4D3E',
                    }}
                >
                    {optimizing
                        ? <ActivityIndicator color="#1B4D3E" size="small" />
                        : <Zap color="white" size={15} />
                    }
                    <Text style={{ fontWeight: '900', fontSize: 12, color: optimizing ? '#6b7280' : 'white' }}>
                        {optimizing ? 'Optimizing…' : result ? 'Re-optimise Route' : 'Optimise Route'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Route summary strip ─────────────────────────────────────── */}
            {result && (
                <View style={{
                    backgroundColor: '#f0fdf4', paddingHorizontal: 20, paddingVertical: 10,
                    flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: '#bbf7d0',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ArrowRight color="#16a34a" size={14} />
                        <Text style={{ fontWeight: '800', color: '#166534', fontSize: 12 }}>{result.totalRouteKm} km</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Clock color="#16a34a" size={14} />
                        <Text style={{ fontWeight: '800', color: '#166534', fontSize: 12 }}>~{result.estimatedMinutes} min</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Package color="#16a34a" size={14} />
                        <Text style={{ fontWeight: '800', color: '#166534', fontSize: 12 }}>{result.sorted.length} stops</Text>
                    </View>
                </View>
            )}

            {/* ══ MAP VIEW ════════════════════════════════════════════════════ */}
            {viewMode === 'map' ? (
                <View style={{ flex: 1 }}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_DEFAULT}
                        style={{ flex: 1 }}
                        initialRegion={driverLatLng ? {
                            latitude:      driverLatLng.lat,
                            longitude:     driverLatLng.lng,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        } : {
                            latitude:      11.0168, // Coimbatore default
                            longitude:     76.9558,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        {/* Road polyline */}
                        {result?.polyline && result.polyline.length > 1 && (
                            <Polyline
                                coordinates={result.polyline.map(p => ({ latitude: p.lat, longitude: p.lng }))}
                                strokeColor="#1B4D3E"
                                strokeWidth={3}
                                lineDashPattern={[0]}
                            />
                        )}

                        {/* Stop markers */}
                        {displayStops.map((stop, idx) => (
                            stop.lat && stop.lng ? (
                                <Marker
                                    key={stop.orderId}
                                    coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                                    title={`${idx + 1}. ${stop.customerName}`}
                                    description={stop.addressText}
                                    pinColor={stopColor(idx)}
                                />
                            ) : null
                        ))}
                    </MapView>

                    {/* Mini next-stop card overlaid on map */}
                    {nextStop && (
                        <View style={{
                            position: 'absolute', bottom: 24, left: 16, right: 16,
                            backgroundColor: 'white', borderRadius: 20, padding: 16,
                            shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
                            flexDirection: 'row', alignItems: 'center', gap: 12,
                        }}>
                            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: stopColor(0), alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>1</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '900', color: '#111827', fontSize: 14 }}>{nextStop.customerName}</Text>
                                <Text style={{ fontSize: 11, color: '#6b7280' }} numberOfLines={1}>{nextStop.addressText}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleOpenMaps(nextStop)}
                                style={{ backgroundColor: '#1B4D3E', padding: 10, borderRadius: 12 }}
                            >
                                <Navigation color="white" size={18} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            ) : (
                /* ══ LIST VIEW ═══════════════════════════════════════════════ */
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={{ padding: 16, paddingBottom: 80 }}>

                        {/* No-orders empty state */}
                        {displayStops.length === 0 && (
                            <View style={{
                                backgroundColor: 'white', borderRadius: 28, padding: 48,
                                alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#e5e7eb', marginTop: 8,
                            }}>
                                <Package size={52} color="#cbd5e1" />
                                <Text style={{ color: '#6b7280', fontWeight: '700', fontSize: 16, marginTop: 16 }}>
                                    No pending deliveries
                                </Text>
                                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                                    You're all caught up! New orders will appear here.
                                </Text>
                            </View>
                        )}

                        {/* Prompt to optimize if not yet done */}
                        {displayStops.length > 0 && !result && (
                            <TouchableOpacity
                                onPress={() => handleOptimizeRoute()}
                                disabled={optimizing}
                                style={{
                                    backgroundColor: '#1B4D3E', borderRadius: 20, padding: 18,
                                    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16,
                                }}
                            >
                                <Zap color="white" size={24} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Optimise Today's Route</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>
                                        Tap to auto-sort {displayStops.length} stops for the shortest path
                                    </Text>
                                </View>
                                {optimizing && <ActivityIndicator color="white" size="small" />}
                            </TouchableOpacity>
                        )}

                        {/* Next Best Delivery hero card */}
                        {nextStop && result && (
                            <View style={{
                                backgroundColor: '#1B4D3E', borderRadius: 28, padding: 20, marginBottom: 16,
                                shadowColor: '#1B4D3E', shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Next Best Delivery</Text>
                                    </View>
                                </View>
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>{nextStop.customerName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                    <MapPin color="rgba(255,255,255,0.7)" size={13} />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, flex: 1 }} numberOfLines={1}>{nextStop.addressText}</Text>
                                </View>
                                <Text style={{ color: '#D4AF37', fontWeight: '900', fontSize: 18, marginTop: 8 }}>₹{nextStop.totalAmount}</Text>

                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                                    <TouchableOpacity
                                        onPress={() => handleOpenMaps(nextStop)}
                                        style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        <Navigation color="white" size={16} />
                                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>Navigate</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeliver(nextStop.orderId)}
                                        style={{ flex: 1, backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        <CheckCircle color="#1B4D3E" size={16} />
                                        <Text style={{ color: '#1B4D3E', fontWeight: '900', fontSize: 13 }}>Mark Delivered</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* All stops in order */}
                        {displayStops.map((stop, idx) => {
                            const isFirst    = idx === 0 && !!result;
                            const isExpanded = expandedId === stop.orderId;
                            const color      = stopColor(idx);

                            return (
                                <View key={stop.orderId} style={{
                                    backgroundColor: 'white', borderRadius: 22, marginBottom: 12,
                                    borderWidth: isFirst ? 0 : 1, borderColor: '#f1f5f9',
                                    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
                                    opacity: isFirst ? 0.6 : 1, // dimmed since shown in hero
                                }}>
                                    <TouchableOpacity
                                        onPress={() => setExpandedId(isExpanded ? null : stop.orderId)}
                                        style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                                        activeOpacity={0.8}
                                    >
                                        {/* Stop number badge */}
                                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>{idx + 1}</Text>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 14 }}>{stop.customerName}</Text>
                                            <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }} numberOfLines={1}>{stop.addressText}</Text>
                                        </View>

                                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                            <Text style={{ fontWeight: '900', color: '#1B4D3E', fontSize: 13 }}>₹{stop.totalAmount}</Text>
                                            {isExpanded
                                                ? <ChevronUp color="#9ca3af" size={14} />
                                                : <ChevronDown color="#9ca3af" size={14} />}
                                        </View>
                                    </TouchableOpacity>

                                    {/* Expanded action row */}
                                    {isExpanded && (
                                        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
                                            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 4 }} />
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <TouchableOpacity
                                                    onPress={() => handleOpenMaps(stop)}
                                                    style={{ flex: 1, backgroundColor: '#eff6ff', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                                >
                                                    <Navigation color="#2563eb" size={15} />
                                                    <Text style={{ color: '#2563eb', fontWeight: '800', fontSize: 12 }}>Navigate</Text>
                                                </TouchableOpacity>

                                                {stop.status === 'get_to_deliver' ? (
                                                    <TouchableOpacity
                                                        onPress={() => handleDeliver(stop.orderId)}
                                                        style={{ flex: 1, backgroundColor: '#1B4D3E', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                                    >
                                                        <CheckCircle color="white" size={15} />
                                                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Delivered</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() => handleStartDelivery(stop.orderId)}
                                                        style={{ flex: 1, backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                                    >
                                                        <Navigation color="white" size={15} />
                                                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Start</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
