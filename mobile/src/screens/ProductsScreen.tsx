import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeft, Repeat, Edit3, CheckCircle2 } from 'lucide-react-native';
import SubscribeSheet, { type SubscribeProduct } from './SubscribeSheet';
import { type FrequencyType } from '../lib/subscriptionUtils';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
}

const PRODUCT_IMAGES: Record<string, any> = {
    'Cow Milk':         require('../../assets/product-raw-milk.png'),
    'Buffalo Milk':     require('../../assets/product-raw-milk.png'),
    'A2 Milk':          require('../../assets/product-raw-milk.png'),
    'Paneer':           require('../../assets/product-paneer.png'),
    'Ghee':             require('../../assets/product-ghee.png'),
    'Curd':             require('../../assets/product-curd.png'),
    'Buttermilk':       require('../../assets/product-buttermilk.png'),
    'Flavoured Milk':   require('../../assets/product-chocolate-milk.png'),
    'Natural Kulfi':    require('../../assets/product-kulfi.png'),
    'Carrot Milk':      require('../../assets/product-carrot-milk.png'),
    'Coconut Oil':      require('../../assets/product-coconut-oil.png'),
    'Sesame Oil':       require('../../assets/product-sesame-oil.png'),
    'Homogenized Milk': require('../../assets/product-homogenized-milk.png'),
    'Pasteurized Milk': require('../../assets/product-pasteurized-milk.png'),
};

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
    product,
    isSubscribed,
    onSubscribe,
    onEdit,
}: {
    product: Product;
    isSubscribed: boolean;
    onSubscribe: (p: Product) => void;
    onEdit: () => void;
}) {
    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            overflow: 'hidden',
            flexDirection: 'row',
            marginBottom: 16,
            borderWidth: 1,
            borderColor: isSubscribed ? '#bbf7d0' : '#f3f4f6',
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        }}>
            {/* Thumbnail */}
            <View style={{ width: 112, height: 112, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    source={PRODUCT_IMAGES[product.name] || require('../../assets/logo.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
                {isSubscribed && (
                    <View style={{
                        position: 'absolute', top: 6, left: 6,
                        backgroundColor: '#16a34a', borderRadius: 10,
                        width: 20, height: 20,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CheckCircle2 color="white" size={13} />
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontWeight: '800', color: '#111827', fontSize: 15, lineHeight: 20 }} numberOfLines={1}>
                        {product.name}
                    </Text>
                    {isSubscribed && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a' }} />
                            <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '700' }}>Active Subscription</Text>
                        </View>
                    )}
                    <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, lineHeight: 16 }} numberOfLines={2}>
                        {product.description}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    {/* Price */}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                        <Text style={{ fontWeight: '900', color: '#1B4D3E', fontSize: 18 }}>₹{product.price}</Text>
                        <Text style={{ fontSize: 10, color: '#9ca3af' }}>/{product.unit}</Text>
                    </View>

                    {/* CTA button */}
                    {isSubscribed ? (
                        <TouchableOpacity
                            onPress={onEdit}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 5,
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
                                borderWidth: 1.5, borderColor: '#16a34a',
                                backgroundColor: '#f0fdf4',
                            }}
                        >
                            <Edit3 color="#16a34a" size={12} />
                            <Text style={{ color: '#16a34a', fontWeight: '900', fontSize: 11 }}>Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => onSubscribe(product)}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 5,
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
                                backgroundColor: '#1B4D3E',
                            }}
                        >
                            <Repeat color="white" size={12} />
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 11 }}>Subscribe</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProductsScreen({ navigation }: any) {
    const { customer } = useAuthStore();
    const [products,          setProducts]          = useState<Product[]>([]);
    const [subscribedIds,     setSubscribedIds]     = useState<Set<string>>(new Set());
    const [loading,           setLoading]           = useState(true);
    const [subscribeProduct,  setSubscribeProduct]  = useState<SubscribeProduct | null>(null);

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('category');
        if (data) setProducts(data);
    };

    const fetchSubscribedIds = async () => {
        if (!customer?.id) return;
        const { data } = await supabase
            .from('subscriptions')
            .select('product_id')
            .eq('customer_id', customer.id)
            .in('status', ['active', 'paused']);
        if (data) {
            setSubscribedIds(new Set(data.map((s: any) => s.product_id)));
        }
    };

    // Reload subscribed IDs every time screen comes into focus
    // (so after navigating back from Subscriptions, the state is fresh)
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            Promise.all([fetchProducts(), fetchSubscribedIds()])
                .finally(() => setLoading(false));
        }, [customer?.id])
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1B4D3E', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>Products</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 }}>
                        🟢 Active subscription  ·  Tap Subscribe to add
                    </Text>
                </View>
            </View>

            {/* List */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D3E" style={{ marginTop: 64 }} />
                ) : (
                    <View style={{ paddingBottom: 80 }}>
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isSubscribed={subscribedIds.has(product.id)}
                                onSubscribe={p =>
                                    setSubscribeProduct({
                                        id:    p.id,
                                        name:  p.name,
                                        price: p.price,
                                        unit:  p.unit,
                                    })
                                }
                                onEdit={() => navigation.navigate('Subscriptions')}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Calendar date picker — confirms then navigates to payment */}
            <SubscribeSheet
                visible={!!subscribeProduct}
                onClose={() => setSubscribeProduct(null)}
                product={subscribeProduct}
                onConfirm={(dates: string[], freq: FrequencyType, qty: number) => {
                    if (!subscribeProduct) return;
                    setSubscribeProduct(null);
                    navigation.navigate('SubscribePayment', {
                        product:       subscribeProduct,
                        selectedDates: dates,
                        frequencyType: freq,
                        quantity:      qty,
                    });
                }}
            />
        </View>
    );
}
