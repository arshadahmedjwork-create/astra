import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert,
} from 'react-native';
import {
    ArrowLeft, Wallet, Repeat, CheckCircle2,
    AlertTriangle, CalendarDays, Package,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { type FrequencyType } from '../lib/subscriptionUtils';

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', weekday: 'short',
    });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscribePaymentScreen({ navigation, route }: any) {
    const { product, selectedDates, frequencyType, quantity } = route.params as {
        product:       { id: string; name: string; price: number; unit: string };
        selectedDates: string[];
        frequencyType: FrequencyType;
        quantity:      number;
    };

    const { customer }       = useAuthStore();
    const [balance, setBalance]   = useState<number>(customer?.wallet_balance ?? 0);
    const [loading, setLoading]   = useState(false);
    const [fetching, setFetching] = useState(true);
    const [done,    setDone]      = useState(false);

    const perDelivery = product.price * quantity;
    const total       = perDelivery * selectedDates.length;
    const isLow       = balance < perDelivery;

    useEffect(() => {
        if (!customer?.id) return;
        supabase
            .from('customers')
            .select('wallet_balance')
            .eq('id', customer.id)
            .single()
            .then(({ data }) => {
                if (data) setBalance(data.wallet_balance ?? 0);
                setFetching(false);
            });
    }, [customer?.id]);

    const handlePay = async () => {
        if (!customer?.id) return;
        if (isLow) {
            Alert.alert(
                'Insufficient Balance',
                `Your wallet (₹${balance.toFixed(0)}) is less than the first delivery cost (₹${perDelivery}). Please top up first.`,
                [
                    { text: 'Top Up', onPress: () => navigation.navigate('Wallet') },
                    { text: 'Cancel', style: 'cancel' },
                ],
            );
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('subscriptions').insert({
                customer_id:    customer.id,
                product_id:     product.id,
                frequency_type: frequencyType,
                selected_dates: selectedDates,
                start_date:     selectedDates[0],
                end_date:       selectedDates[selectedDates.length - 1],
                required_date:  selectedDates[0],
                unit_price:     product.price,
                quantity,
                status:         'active',
            });
            if (error) throw error;
            setDone(true);
            setTimeout(() => navigation.navigate('Subscriptions'), 2200);
        } catch (e: any) {
            Alert.alert('Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ────────────────────────────────────────────────────────
    if (done) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <View style={{ width: 100, height: 100, backgroundColor: '#dcfce7', borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <CheckCircle2 color="#16a34a" size={56} />
                </View>
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center' }}>Subscribed! 🎉</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 12, lineHeight: 22, fontSize: 14 }}>
                    {selectedDates.length} deliveries of {product.name} are now scheduled.{'\n'}
                    Wallet will be debited ₹{perDelivery} on each delivery day.
                </Text>
                <Text style={{ color: '#9ca3af', marginTop: 16, fontSize: 12 }}>Redirecting to subscriptions…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1B4D3E', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginBottom: 12, alignSelf: 'flex-start' }}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Confirm Payment
                </Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 2 }}>{product.name}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>

                {/* Delivery summary */}
                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', gap: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Delivery Schedule
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {/* Frequency badge */}
                        <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <Repeat color="#16a34a" size={20} />
                            <Text style={{ fontWeight: '900', color: '#15803d', fontSize: 13, textTransform: 'capitalize' }}>{frequencyType}</Text>
                            <Text style={{ fontSize: 10, color: '#9ca3af' }}>frequency</Text>
                        </View>
                        {/* Dates count */}
                        <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <CalendarDays color="#16a34a" size={20} />
                            <Text style={{ fontWeight: '900', color: '#15803d', fontSize: 13 }}>{selectedDates.length}</Text>
                            <Text style={{ fontSize: 10, color: '#9ca3af' }}>deliveries</Text>
                        </View>
                        {/* Quantity */}
                        <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <Package color="#16a34a" size={20} />
                            <Text style={{ fontWeight: '900', color: '#15803d', fontSize: 13 }}>{quantity}</Text>
                            <Text style={{ fontSize: 10, color: '#9ca3af' }}>{product.unit}/delivery</Text>
                        </View>
                    </View>

                    {/* Date range pills */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <Text style={{ fontSize: 9, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>First Delivery</Text>
                            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 12 }}>{formatDate(selectedDates[0])}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <Text style={{ fontSize: 9, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 }}>Last Delivery</Text>
                            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 12 }}>{formatDate(selectedDates[selectedDates.length - 1])}</Text>
                        </View>
                    </View>
                </View>

                {/* Wallet Balance */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Wallet')}
                    style={{
                        backgroundColor: isLow ? '#fff1f2' : 'white',
                        borderRadius: 24, padding: 20,
                        borderWidth: 1.5,
                        borderColor: isLow ? '#fecdd3' : '#f1f5f9',
                        flexDirection: 'row', alignItems: 'center', gap: 16,
                    }}
                >
                    <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: isLow ? '#fee2e2' : '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                        {isLow ? <AlertTriangle color="#dc2626" size={26} /> : <Wallet color="#16a34a" size={26} />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: isLow ? '#9f1239' : '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            Wallet Balance
                        </Text>
                        {fetching
                            ? <ActivityIndicator color="#1B4D3E" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                            : <Text style={{ fontSize: 28, fontWeight: '900', color: isLow ? '#dc2626' : '#1B4D3E', marginTop: 2 }}>
                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        }
                        {isLow && (
                            <Text style={{ fontSize: 11, color: '#dc2626', marginTop: 2, fontWeight: '600' }}>
                                Need ₹{perDelivery} for first delivery — tap to top up
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Cost Breakdown */}
                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', gap: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Cost Breakdown
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>Unit price</Text>
                        <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>₹{product.price}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>Quantity</Text>
                        <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>× {quantity} {product.unit}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>Per delivery</Text>
                        <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>₹{perDelivery}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>Deliveries</Text>
                        <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>× {selectedDates.length}</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '900', color: '#111827', fontSize: 16 }}>Period Total</Text>
                        <Text style={{ fontWeight: '900', color: '#1B4D3E', fontSize: 26 }}>₹{total.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic', textAlign: 'right' }}>
                        *₹{perDelivery} deducted from wallet each delivery day
                    </Text>
                </View>

                {/* Pay CTA */}
                {isLow ? (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Wallet')}
                        style={{ backgroundColor: '#dc2626', borderRadius: 20, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                    >
                        <Wallet color="white" size={18} />
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Top Up Wallet First</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handlePay}
                        disabled={loading || fetching}
                        style={{ backgroundColor: '#22c55e', borderRadius: 20, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: loading || fetching ? 0.7 : 1 }}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <>
                                <CheckCircle2 color="white" size={20} />
                                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Pay & Subscribe — ₹{total.toLocaleString('en-IN')}</Text>
                            </>
                        }
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}
