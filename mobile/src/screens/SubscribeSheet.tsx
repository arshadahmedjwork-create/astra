import React, { useState, useMemo } from 'react';
import {
    Modal, View, Text, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { X, Repeat, CalendarDays, Minus, Plus, CheckCircle2, ArrowRight, ShoppingCart } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import {
    generateDatesFromFrequency, toggleDate,
    calculateSubscriptionTotal, type FrequencyType,
} from '../lib/subscriptionUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubscribeProduct {
    id: string;
    name: string;
    price: number;
    unit: string;
    category?: string;
    purchase_type?: 'daily' | 'subscription' | 'both';
}

interface Props {
    visible: boolean;
    onClose: () => void;
    product: SubscribeProduct | null;
    /** If provided, clicking the CTA will call this and NOT create the subscription directly */
    onConfirm?: (dates: string[], frequency: FrequencyType, quantity: number) => void;
    /** For quick "Buy Once" from within the same sheet */
    onBuyOnce?: (product: SubscribeProduct) => void;
    /** Fallback: called after direct subscription creation (when onConfirm is NOT provided) */
    onSuccess?: () => void;
}

// ─── Frequency Options ────────────────────────────────────────────────────────

const FREQ_OPTIONS: { key: FrequencyType; label: string; desc: string }[] = [
    { key: 'daily',     label: 'Daily',     desc: 'Every day' },
    { key: 'alternate', label: 'Alt. Days', desc: 'Every 2nd' },
    { key: 'weekdays',  label: 'Weekdays',  desc: 'Mon–Fri' },
    { key: 'custom',    label: 'Custom',    desc: 'Pick dates' },
];

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Calendar green theme ─────────────────────────────────────────────────────

const CALENDAR_THEME = {
    selectedDayBackgroundColor: '#1B4D3E',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#1B4D3E',
    arrowColor: '#1B4D3E',
    dotColor: '#1B4D3E',
    selectedDotColor: '#ffffff',
    textMonthFontWeight: '800' as const,
    textMonthFontSize: 15,
    textDayFontWeight: '600' as const,
    calendarBackground: 'transparent',
    dayTextColor: '#111827',
    textDisabledColor: '#d1d5db',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubscribeSheet({ visible, onClose, product, onConfirm, onBuyOnce, onSuccess }: Props) {
    const { customer } = useAuthStore();
    const [frequency,   setFrequency]   = useState<FrequencyType>('daily');
    const [rangeStart,  setRangeStart]  = useState<string | null>(null);
    const [rangeEnd,    setRangeEnd]    = useState<string | null>(null);
    const [customDates, setCustomDates] = useState<string[]>([]);
    const [quantity,    setQuantity]    = useState(1);
    const [loading,     setLoading]     = useState(false);
    const [success,     setSuccess]     = useState(false);

    const today = todayStr();

    React.useEffect(() => {
        if (product?.category === 'Milk' && rangeStart) {
            const start = new Date(rangeStart + 'T00:00:00');
            const end = new Date(start);
            end.setMonth(start.getMonth() + 1);
            setRangeEnd(end.toISOString().split('T')[0]);
        }
    }, [product?.id, rangeStart]);

    // Initial default for Milk
    React.useEffect(() => {
        if (product?.category === 'Milk') {
            setRangeStart(today);
        }
    }, [product?.id]);

    const selectedDates = useMemo((): string[] => {
        if (!product) return [];
        if (frequency === 'custom') return customDates;
        if (!rangeStart || !rangeEnd) return [];
        return generateDatesFromFrequency(
            new Date(rangeStart + 'T00:00:00'),
            new Date(rangeEnd   + 'T00:00:00'),
            frequency,
        );
    }, [frequency, rangeStart, rangeEnd, customDates, product]);

    const total = product
        ? calculateSubscriptionTotal(product.price, quantity, selectedDates)
        : 0;

    // ─── Marked dates with green ──────────────────────────────────────────────
    const markedDates = useMemo(() => {
        const GREEN       = '#1B4D3E';
        const GREEN_LIGHT = '#ecfdf5';

        if (frequency === 'custom') {
            const marks: Record<string, any> = {};
            customDates.forEach(d => {
                marks[d] = { selected: true, selectedColor: GREEN, selectedTextColor: '#fff' };
            });
            return marks;
        }

        if (!rangeStart) return {};

        const allDates = rangeStart && rangeEnd
            ? generateDatesFromFrequency(
                new Date(rangeStart + 'T00:00:00'),
                new Date(rangeEnd   + 'T00:00:00'),
                frequency,
            )
            : [rangeStart];

        const marks: Record<string, any> = {};
        allDates.forEach((d, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === allDates.length - 1;
            marks[d] = {
                selected: true,
                selectedColor: GREEN,
                selectedTextColor: '#fff',
                startingDay: isFirst,
                endingDay:   isLast,
                color:       isFirst || isLast ? GREEN : GREEN_LIGHT,
                textColor:   isFirst || isLast ? '#fff' : '#064e3b',
            };
        });
        return marks;
    }, [frequency, rangeStart, rangeEnd, customDates]);

    const handleDayPress = (day: { dateString: string }) => {
        const d = day.dateString;
        if (d < today) return;

        if (frequency === 'custom') {
            setCustomDates(prev => toggleDate(prev, d));
            return;
        }

        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(d);
            if (product?.category !== 'Milk') {
                setRangeEnd(null);
            }
        } else {
            if (d < rangeStart) {
                setRangeStart(d);
                if (product?.category !== 'Milk') {
                    setRangeEnd(null);
                }
            } else if (product?.category !== 'Milk') {
                setRangeEnd(d);
            }
        }
    };

    const resetState = () => {
        setFrequency('daily');
        setRangeStart(null);
        setRangeEnd(null);
        setCustomDates([]);
        setQuantity(1);
        setSuccess(false);
    };

    const handleClose = () => { resetState(); onClose(); };

    // ─── CTA handler ──────────────────────────────────────────────────────────
    const handleCTA = async () => {
        if (!product || selectedDates.length === 0) {
            Alert.alert('No dates', 'Please select at least one delivery date.');
            return;
        }

        // → Payment flow: hand off to parent
        if (onConfirm) {
            onConfirm(selectedDates, frequency, quantity);
            resetState();
            return;
        }

        // → Direct insertion (legacy / SubscribePaymentScreen internal use)
        if (!customer?.id) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('subscriptions').insert({
                customer_id:    customer.id,
                product_id:     product.id,
                frequency_type: frequency,
                selected_dates: selectedDates,
                start_date:     selectedDates[0],
                end_date:       selectedDates[selectedDates.length - 1],
                required_date:  selectedDates[0],
                unit_price:     product.price,
                quantity,
                status:         'active',
            });
            if (error) throw error;
            setSuccess(true);
            onSuccess?.();
            setTimeout(() => handleClose(), 1800);
        } catch (e: any) {
            Alert.alert('Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!visible || !product) return null;

    const pType = product.purchase_type || 'both';
    const showBuyOnce = pType === 'both' || pType === 'daily';
    const showSub     = pType === 'both' || pType === 'subscription';

    const ctaLabel = onConfirm
        ? (selectedDates.length === 0 ? 'Select dates to continue' : `Confirm ${selectedDates.length} Date${selectedDates.length !== 1 ? 's' : ''} →`)
        : (selectedDates.length === 0 ? 'Select dates to continue' : `Subscribe Now · ₹${total}`);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <Pressable style={{ flex: 1 }} onPress={handleClose} />

                <View style={{ backgroundColor: '#F9FAFB', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '94%', overflow: 'hidden' }}>
                    {success ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
                            <View style={{ width: 80, height: 80, backgroundColor: '#f0fdf4', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <CheckCircle2 color="#22c55e" size={44} />
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', textAlign: 'center' }}>Subscribed!</Text>
                            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                                {selectedDates.length} deliveries scheduled for {product.name}.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Header */}
                            <View style={{ backgroundColor: '#1B4D3E', padding: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Repeat color="rgba(255,255,255,0.7)" size={15} />
                                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                            Select Options
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
                                        <X color="white" size={20} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>{product.name}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
                                    ₹{product.price} / {product.unit}
                                </Text>
                            </View>

                            <View style={{ padding: 24, gap: 24 }}>
                                
                                {/* ─── OPTION 1: BUY ONCE ─── */}
                                {showBuyOnce && (
                                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>Choice 1: One-Time Order</Text>
                                            <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                                <Text style={{ color: '#92400E', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>Popular</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 16 }}>Just need it once? No commitment required.</Text>
                                        
                                        <TouchableOpacity
                                            onPress={() => { if (onBuyOnce) { onBuyOnce(product); handleClose(); } }}
                                            activeOpacity={0.8}
                                            style={{ 
                                                backgroundColor: '#F9FAFB', 
                                                borderWidth: 1.5, 
                                                borderColor: '#E5E7EB',
                                                borderRadius: 16, 
                                                paddingVertical: 14, 
                                                flexDirection: 'row', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: 8 
                                            }}
                                        >
                                            <ShoppingCart color="#1B4D3E" size={18} />
                                            <Text style={{ color: '#111827', fontWeight: '900', fontSize: 15 }}>Add to My Cart</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                { /* Divider - Only show if both options are available */ }
                                {showBuyOnce && showSub && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase' }}>OR</Text>
                                        <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                                    </View>
                                )}

                                {/* ─── OPTION 2: SUBSCRIPTION ─── */}
                                {showSub && (
                                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                            <View style={{ width: 36, height: 36, backgroundColor: '#ECFDF5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                <Repeat color="#1B4D3E" size={20} />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>Choice 2: Buy Products (Sub)</Text>
                                                <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '800' }}>Schedule regular deliveries</Text>
                                            </View>
                                        </View>

                                        {/* Frequency tabs */}
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                                                Delivery Frequency
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                {FREQ_OPTIONS.map(opt => (
                                                    <TouchableOpacity
                                                        key={opt.key}
                                                        onPress={() => { setFrequency(opt.key); setRangeStart(null); setRangeEnd(null); setCustomDates([]); }}
                                                        style={{
                                                            flex: 1, paddingVertical: 12, paddingHorizontal: 4,
                                                            borderRadius: 18, borderWidth: 1.5, alignItems: 'center',
                                                            backgroundColor: frequency === opt.key ? '#1B4D3E' : 'white',
                                                            borderColor:     frequency === opt.key ? '#1B4D3E' : '#e5e7eb',
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 11, fontWeight: '900', color: frequency === opt.key ? 'white' : '#111827' }}>
                                                            {opt.label}
                                                        </Text>
                                                        <Text style={{ fontSize: 8, marginTop: 2, color: frequency === opt.key ? 'rgba(255,255,255,0.6)' : '#9ca3af', textAlign: 'center' }}>
                                                            {opt.desc}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Calendar */}
                                        <View style={{ marginBottom: 20 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
                                                {frequency === 'custom' ? '🟢 Toggle dates' : '🟢 Tap start, then end date'}
                                            </Text>

                                            {frequency !== 'custom' && (rangeStart || rangeEnd) && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 8 }}>
                                                    <CalendarDays color="#16a34a" size={14} />
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803d', flex: 1 }}>
                                                        {rangeStart && !rangeEnd
                                                            ? `Start: ${rangeStart}`
                                                            : `${rangeStart} → ${rangeEnd}`}
                                                    </Text>
                                                </View>
                                            )}

                                            <Calendar
                                                onDayPress={handleDayPress}
                                                markedDates={markedDates}
                                                markingType={frequency === 'custom' ? 'simple' : 'period'}
                                                minDate={today}
                                                theme={CALENDAR_THEME}
                                                style={{ borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' }}
                                            />
                                        </View>

                                        {/* Quantity */}
                                        <View style={{ marginBottom: 24 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                                                Qty per Delivery
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6', padding: 10, alignSelf: 'flex-start', gap: 16 }}>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                                    style={{ width: 36, height: 36, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Minus color="#1B4D3E" size={18} />
                                                </TouchableOpacity>
                                                <View style={{ alignItems: 'center', minWidth: 36 }}>
                                                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>{quantity}</Text>
                                                    <Text style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', fontWeight: '700' }}>{product.unit}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => setQuantity(quantity + 1)}
                                                    style={{ width: 36, height: 36, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Plus color="#1B4D3E" size={18} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* CTA */}
                                        <TouchableOpacity
                                            onPress={handleCTA}
                                            disabled={loading || selectedDates.length === 0}
                                            style={{
                                                height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                                                flexDirection: 'row', gap: 8,
                                                backgroundColor: selectedDates.length === 0 ? '#E5E7EB' : '#1B4D3E',
                                                shadowColor: '#1B4D3E', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
                                            }}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Text style={{ fontWeight: '900', fontSize: 16, color: selectedDates.length === 0 ? '#9ca3af' : 'white' }}>
                                                        {ctaLabel}
                                                    </Text>
                                                    {selectedDates.length > 0 && onConfirm && (
                                                        <ArrowRight color="white" size={18} />
                                                    )}
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

