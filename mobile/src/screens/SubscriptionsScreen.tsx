import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import {
    ChevronLeft, Repeat, Package, Clock, ShieldAlert,
    CalendarDays, Edit3, Minus, Plus, X, CheckCircle2, CalendarX2,
} from 'lucide-react-native';
import { getRemainingDeliveries, getNextDeliveryDate, formatDeliveryDate } from '../lib/subscriptionUtils';

interface Subscription {
    id: string;
    product_name: string;
    product_id: string;
    frequency_type: string;
    selected_dates: string[];
    start_date: string | null;
    end_date: string | null;
    quantity: number;
    status: string;
    unit_price: number;
}

// ─── Status colour helpers ────────────────────────────────────────────────────

function statusColor(status: string): { bg: string; dot: string; label: string } {
    switch (status.toLowerCase()) {
        case 'active':
        case 'pending':
            return { bg: '#fef9c3', dot: '#ca8a04', label: status === 'pending' ? 'Pending' : 'Active' };
        case 'delivered':
            return { bg: '#dcfce7', dot: '#16a34a', label: 'Delivered' };
        case 'paused':
            return { bg: '#fff7ed', dot: '#ea580c', label: 'Paused' };
        case 'cancelled':
        case 'opted_out':
            return { bg: '#fee2e2', dot: '#dc2626', label: 'Opted Out' };
        default:
            return { bg: '#f1f5f9', dot: '#94a3b8', label: status };
    }
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
    sub: Subscription | null;
    onClose: () => void;
    onSave: (id: string, qty: number, newDates: string[]) => Promise<void>;
    onOptOut: (id: string) => Promise<void>;
}

function chipDate(dateStr: string) {
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch { return dateStr; }
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function EditModal({ sub, onClose, onSave, onOptOut }: EditModalProps) {
    const [qty,         setQty]         = useState(sub?.quantity ?? 1);
    const [skipped,     setSkipped]     = useState<Set<string>>(new Set());
    const [showSkip,    setShowSkip]    = useState(false);
    const [saving,      setSaving]      = useState(false);

    useEffect(() => {
        setQty(sub?.quantity ?? 1);
        setSkipped(new Set());
        setShowSkip(false);
    }, [sub]);

    if (!sub) return null;

    const today = todayStr();
    const upcomingDates = (sub.selected_dates || [])
        .filter(d => d >= today)
        .sort();

    const handleSave = async () => {
        setSaving(true);
        // Build new dates: keep all dates, remove skipped upcoming ones
        const newDates = (sub.selected_dates || []).filter(d => !skipped.has(d));
        await onSave(sub.id, qty, newDates);
        setSaving(false);
        onClose();
    };

    const toggleSkip = (date: string) => {
        setSkipped(prev => {
            const next = new Set(prev);
            if (next.has(date)) next.delete(date);
            else next.add(date);
            return next;
        });
    };

    const handleOptOut = () => {
        Alert.alert(
            'Cancel Entire Subscription',
            'This will cancel ALL remaining deliveries. To skip only specific days, use the "Skip Specific Days" option instead.',
            [
                { text: 'Keep It', style: 'cancel' },
                {
                    text: 'Cancel All', style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        await onOptOut(sub.id);
                        setSaving(false);
                        onClose();
                    },
                },
            ],
        );
    };

    return (
        <Modal visible={!!sub} animationType="slide" transparent onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '90%' }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={{ padding: 28, paddingBottom: 40 }}>

                            {/* Handle */}
                            <View style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                            {/* Title */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <View>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Edit Subscription</Text>
                                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 2 }}>{sub.product_name}</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={{ padding: 6, backgroundColor: '#f9fafb', borderRadius: 12 }}>
                                    <X color="#6b7280" size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Quantity Picker */}
                            <Text style={{ fontSize: 11, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                                Quantity per Delivery
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 24, backgroundColor: '#f9fafb', borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6', paddingVertical: 12, paddingHorizontal: 20, marginBottom: 20 }}>
                                <TouchableOpacity
                                    onPress={() => setQty(Math.max(1, qty - 1))}
                                    style={{ width: 44, height: 44, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Minus color="#1B4D3E" size={20} />
                                </TouchableOpacity>
                                <View style={{ alignItems: 'center', minWidth: 60 }}>
                                    <Text style={{ fontSize: 32, fontWeight: '900', color: '#111827' }}>{qty}</Text>
                                    <Text style={{ fontSize: 9, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>units</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setQty(qty + 1)}
                                    style={{ width: 44, height: 44, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Plus color="#1B4D3E" size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Per delivery cost */}
                            <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 14, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#374151', fontWeight: '700', fontSize: 13 }}>Cost per delivery</Text>
                                <Text style={{ color: '#1B4D3E', fontWeight: '900', fontSize: 18 }}>₹{(sub.unit_price * qty).toFixed(0)}</Text>
                            </View>

                            {/* ── Skip Specific Days ─────────────────────────────── */}
                            <TouchableOpacity
                                onPress={() => setShowSkip(v => !v)}
                                style={{
                                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: '#fefce8', borderRadius: 16, padding: 14, marginBottom: 12,
                                    borderWidth: 1, borderColor: '#fef08a',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <CalendarX2 color="#ca8a04" size={18} />
                                    <View>
                                        <Text style={{ fontWeight: '800', color: '#92400e', fontSize: 13 }}>Skip Specific Days</Text>
                                        <Text style={{ fontSize: 10, color: '#a16207', marginTop: 1 }}>
                                            {skipped.size > 0
                                                ? `${skipped.size} day${skipped.size > 1 ? 's' : ''} marked to skip`
                                                : 'Pause individual deliveries'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={{ color: '#ca8a04', fontWeight: '900', fontSize: 13 }}>
                                    {showSkip ? '▲ Hide' : '▼ Show'}
                                </Text>
                            </TouchableOpacity>

                            {showSkip && (
                                <View style={{ backgroundColor: '#fffbeb', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#fef08a' }}>
                                    {upcomingDates.length === 0 ? (
                                        <Text style={{ color: '#92400e', fontSize: 12, textAlign: 'center', padding: 8 }}>
                                            No upcoming scheduled dates found.{"\n"}Subscribe with specific dates to use this feature.
                                        </Text>
                                    ) : (
                                        <View>
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#a16207', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                                                Tap dates to skip · {upcomingDates.length - skipped.size} of {upcomingDates.length} active
                                            </Text>

                                            {/* Date chips grid */}
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                {upcomingDates.map(date => {
                                                    const isSkipped = skipped.has(date);
                                                    return (
                                                        <TouchableOpacity
                                                            key={date}
                                                            onPress={() => toggleSkip(date)}
                                                            style={{
                                                                paddingHorizontal: 12, paddingVertical: 7,
                                                                borderRadius: 12, borderWidth: 1.5,
                                                                backgroundColor: isSkipped ? '#fee2e2' : 'white',
                                                                borderColor:     isSkipped ? '#fca5a5' : '#d1fae5',
                                                            }}
                                                        >
                                                            <Text style={{
                                                                fontSize: 11, fontWeight: '700',
                                                                color: isSkipped ? '#dc2626' : '#1B4D3E',
                                                                textDecorationLine: isSkipped ? 'line-through' : 'none',
                                                            }}>
                                                                {chipDate(date)}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>

                                            {skipped.size > 0 && (
                                                <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: '700' }}>
                                                        Skipping {skipped.size} delivery{skipped.size > 1 ? 's' : ''} · saving ₹{(sub.unit_price * qty * skipped.size).toFixed(0)}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => setSkipped(new Set())}>
                                                        <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600' }}>Clear</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Save Changes */}
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                style={{ backgroundColor: '#1B4D3E', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
                            >
                                {saving
                                    ? <ActivityIndicator color="white" />
                                    : <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
                                        {skipped.size > 0 ? `Save · Skip ${skipped.size} Day${skipped.size > 1 ? 's' : ''}` : 'Save Changes'}
                                    </Text>
                                }
                            </TouchableOpacity>

                            {/* Cancel All (Opt Out entirely) */}
                            <TouchableOpacity
                                onPress={handleOptOut}
                                disabled={saving}
                                style={{ borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 18, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                            >
                                <X color="#dc2626" size={16} />
                                <Text style={{ color: '#dc2626', fontWeight: '900', fontSize: 14 }}>Cancel Entire Subscription</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SubscriptionsScreen({ navigation }: any) {
    const { customer }                                = useAuthStore();
    const [subscriptions, setSubscriptions]           = useState<Subscription[]>([]);
    const [loading,   setLoading]                     = useState(true);
    const [dailyCost, setDailyCost]                   = useState(0);
    const [editSub,   setEditSub]                     = useState<Subscription | null>(null);

    useEffect(() => {
        if (customer?.id) fetchData();
    }, [customer?.id]);

    const fetchData = async () => {
        if (!customer?.id) return;
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*, products(name, price)')
                .eq('customer_id', customer.id)
                .neq('status', 'cancelled');

            if (error) {
                // Show the actual DB error so we can diagnose
                Alert.alert('DB Error', error.message || JSON.stringify(error));
                setLoading(false);
                return;
            }

            const subs: Subscription[] = (data || []).map((s: any) => {
                // products may come back as object or single-item array
                const prod = Array.isArray(s.products) ? s.products[0] : s.products;

                // selected_dates can be null, [] or a proper string[]
                const dates: string[] = Array.isArray(s.selected_dates) ? s.selected_dates : [];

                // frequency_type may have been stored as 'frequency' in older rows
                const freq = s.frequency_type || s.frequency || 'daily';

                // unit_price: prefer product's actual price, fall back to stored
                const price = prod?.price ?? s.unit_price ?? 0;

                return {
                    id:             s.id,
                    product_id:     s.product_id   || '',
                    product_name:   prod?.name     || 'Unknown Product',
                    frequency_type: freq,
                    selected_dates: dates,
                    start_date:     s.start_date   || null,
                    end_date:       s.end_date     || null,
                    quantity:       s.quantity     || 1,
                    status:         s.status       || 'active',
                    unit_price:     price,
                };
            });

            setSubscriptions(subs);
            const total = subs
                .filter(s => s.status === 'active')
                .reduce((acc, s) => acc + s.unit_price * s.quantity, 0);
            setDailyCost(total);
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Unexpected error loading subscriptions.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async (id: string, qty: number, newDates: string[]) => {
        const { error } = await supabase
            .from('subscriptions')
            .update({ quantity: qty, selected_dates: newDates })
            .eq('id', id);
        if (error) { Alert.alert('Error', error.message); return; }
        setSubscriptions(prev => prev.map(s => s.id === id
            ? { ...s, quantity: qty, selected_dates: newDates }
            : s));
        Alert.alert('Updated', 'Subscription updated successfully.');
    };

    const handleOptOut = async (id: string) => {
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', id);
        if (error) { Alert.alert('Error', error.message); return; }
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        Alert.alert('Opted Out', 'You have been opted out of this subscription.');
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1B4D3E', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
                        <ChevronLeft color="white" size={28} />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>My Subscriptions</Text>
                </View>
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 12, paddingHorizontal: 24 }}>
                {[
                    { dot: '#16a34a', label: 'Delivered' },
                    { dot: '#ca8a04', label: 'Active/Pending' },
                    { dot: '#dc2626', label: 'Opted Out' },
                ].map(item => (
                    <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.dot }} />
                        <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: '600' }}>{item.label}</Text>
                    </View>
                ))}
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D3E" style={{ marginTop: 40 }} />
                ) : (
                    <View style={{ paddingBottom: 48 }}>

                        {/* Low wallet warning */}
                        {dailyCost > (customer?.wallet_balance ?? 0) && (
                            <View style={{ backgroundColor: '#fee2e2', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <ShieldAlert color="#dc2626" size={22} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#991b1b', fontWeight: '900', fontSize: 13 }}>Low Wallet Balance</Text>
                                    <Text style={{ color: '#dc2626', fontSize: 11, marginTop: 2 }}>
                                        Daily cost ₹{dailyCost} exceeds balance ₹{customer?.wallet_balance ?? 0}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Wallet')}
                                    style={{ backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 11 }}>Top Up</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {subscriptions.length === 0 ? (
                            <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 40, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#e5e7eb' }}>
                                <Package size={52} color="#cbd5e1" />
                                <Text style={{ color: '#6b7280', marginTop: 16, fontWeight: '600', textAlign: 'center' }}>No active subscriptions</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Products')}
                                    style={{ marginTop: 16, backgroundColor: '#1B4D3E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '900' }}>Browse Products</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            subscriptions.map(sub => {
                                const sc = statusColor(sub.status);
                                const remaining = getRemainingDeliveries(sub.selected_dates || []);
                                const nextDate  = getNextDeliveryDate(sub.selected_dates || []);

                                return (
                                    <View key={sub.id} style={{ backgroundColor: 'white', borderRadius: 28, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' }}>

                                        {/* Top row: name + status badge */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text style={{ fontWeight: '900', fontSize: 17, color: '#111827' }}>{sub.product_name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    <Repeat color="#1B4D3E" size={11} />
                                                    <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                                                        {sub.frequency_type || 'Daily'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Colour-coded status badge */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                                                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: sc.dot }} />
                                                <Text style={{ fontSize: 10, fontWeight: '900', color: sc.dot, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    {sc.label}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Delivery info pill */}
                                        {sub.selected_dates.length > 0 ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#f0fdf4', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                                                <CalendarDays color="#1B4D3E" size={14} />
                                                <View>
                                                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#1B4D3E' }}>
                                                        {remaining} delivery{remaining !== 1 ? 's' : ''} remaining
                                                    </Text>
                                                    {nextDate && (
                                                        <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>
                                                            Next: {formatDeliveryDate(nextDate)}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        ) : (sub.start_date || sub.end_date) ? (
                                            // Fallback: show start → end date range when selected_dates not stored
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#f0fdf4', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                                                <CalendarDays color="#1B4D3E" size={14} />
                                                <View>
                                                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#1B4D3E' }}>
                                                        {sub.start_date && sub.end_date
                                                            ? `${formatDeliveryDate(sub.start_date)} → ${formatDeliveryDate(sub.end_date)}`
                                                            : sub.start_date
                                                            ? `From ${formatDeliveryDate(sub.start_date)}`
                                                            : 'Schedule set'}
                                                    </Text>
                                                    <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Recurring delivery</Text>
                                                </View>
                                            </View>
                                        ) : null}

                                        {/* Bottom row: qty + Edit button */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f9fafb' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Package size={15} color="#64748b" />
                                                <Text style={{ color: '#6b7280', fontWeight: '700', fontSize: 13 }}>
                                                    Qty: {sub.quantity}  ·  ₹{(sub.unit_price * sub.quantity).toFixed(0)}/delivery
                                                </Text>
                                            </View>

                                            {/* Edit button */}
                                            <TouchableOpacity
                                                onPress={() => setEditSub(sub)}
                                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#bbf7d0' }}
                                            >
                                                <Edit3 color="#1B4D3E" size={14} />
                                                <Text style={{ color: '#1B4D3E', fontWeight: '900', fontSize: 12 }}>Edit</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}

                        {/* Delivery rules */}
                        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 24, padding: 20, marginTop: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Clock size={15} color="#1B4D3E" />
                                <Text style={{ color: '#1B4D3E', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Delivery Rules</Text>
                            </View>
                            {[
                                '7 PM cut-off: changes after 7 PM take effect after 24 hours.',
                                'Early morning delivery: 5:00 AM – 7:30 AM.',
                                'Wallet must have sufficient balance on each delivery day.',
                            ].map((rule, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#1B4D3E', marginTop: 5 }} />
                                    <Text style={{ color: '#166534', fontSize: 11, fontWeight: '600', flex: 1, lineHeight: 17 }}>{rule}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <EditModal
                sub={editSub}
                onClose={() => setEditSub(null)}
                onSave={handleSaveEdit}
                onOptOut={handleOptOut}
            />
        </View>
    );
}
