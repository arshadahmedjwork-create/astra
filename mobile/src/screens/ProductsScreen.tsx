import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeft, Repeat, Edit3, CheckCircle2, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import SubscribeSheet, { type SubscribeProduct } from './SubscribeSheet';
import { type FrequencyType } from '../lib/subscriptionUtils';
import { useCartStore } from '../stores/cartStore';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
    purchase_type?: 'daily' | 'subscription' | 'both';
}

const PRODUCT_IMAGES: Record<string, any> = {
    'Cow Milk':         require('../../assets/product_raw_milk.jpg'),
    'Buffalo Milk':     require('../../assets/product_raw_milk.jpg'),
    'A2 Milk':          require('../../assets/product_raw_milk.jpg'),
    'Paneer':           require('../../assets/product-paneer.png'),
    'Ghee':             require('../../assets/product-ghee.png'),
    'Curd':             require('../../assets/product-curd.png'),
    'Buttermilk':       require('../../assets/product-buttermilk.png'),
    'Flavoured Milk':   require('../../assets/product-chocolate-milk.png'),
    'Natural Kulfi':    require('../../assets/product_kulfi.jpg'),
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
    isInCart,
    onSubscribe,
    onAddToCart,
    onEdit,
}: {
    product: Product;
    isSubscribed: boolean;
    isInCart: boolean;
    onSubscribe: (p: Product) => void;
    onAddToCart: (p: Product) => void;
    onEdit: () => void;
}) {
    return (
        <View style={{
            borderRadius: 24,
            overflow: 'hidden',
            flexDirection: 'row',
            marginBottom: 16,
            borderWidth: 1,
            borderColor: isSubscribed ? '#bbf7d0' : '#f3f4f6',
            backgroundColor: isSubscribed ? '#f0fdf4' : 'white',
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

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    {/* Price */}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                        <Text style={{ fontWeight: '900', color: '#1B4D3E', fontSize: 18 }}>₹{product.price}</Text>
                        <Text style={{ fontSize: 10, color: '#9ca3af' }}>/{product.unit}</Text>
                    </View>

                    {/* Unified Purchase Action */}
                    <TouchableOpacity
                        onPress={() => isSubscribed ? onEdit() : onSubscribe(product)}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: isSubscribed ? '#ffffff' : '#1B4D3E',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: isSubscribed ? 1 : 0,
                            borderColor: '#1B4D3E',
                            gap: 8,
                            shadowColor: '#1B4D3E',
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            elevation: 3,
                        }}
                    >
                        <Text style={{ 
                            color: isSubscribed ? '#1B4D3E' : 'white', 
                            fontWeight: '900', 
                            fontSize: 13 
                        }}>
                            {isSubscribed ? 'Manage' : (product.purchase_type === 'subscription' ? 'Subscribe' : 'Purchase')}
                        </Text>
                        {isSubscribed ? (
                            <Repeat color="#1B4D3E" size={14} />
                        ) : (
                            <ArrowLeft color="white" size={14} style={{ transform: [{ rotate: '180deg' }] }} />
                        )}
                    </TouchableOpacity>
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
    const { addItem, isInCart, items } = useCartStore();
    const cartCount = items.length;

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
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>Buy Products</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 }}>
                        Pick a product to buy once or start a subscription
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
                                isInCart={isInCart(product.id)}
                                onSubscribe={p =>
                                    setSubscribeProduct({
                                        id:    p.id,
                                        name:  p.name,
                                        price: p.price,
                                        unit:  p.unit,
                                        category: p.category,
                                        purchase_type: p.purchase_type,
                                    })
                                }
                                onAddToCart={p => {
                                    addItem({
                                        id: p.id,
                                        name: p.name,
                                        price: p.price,
                                        unit: p.unit,
                                    });
                                }}
                                onEdit={() => navigation.navigate('Subscriptions')}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Cart')}
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: '#1B4D3E',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 24,
                            paddingVertical: 18,
                            borderRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 }}>
                                <ShoppingBag color="white" size={20} />
                            </View>
                            <View>
                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>View Your Cart</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{cartCount} items selected</Text>
                            </View>
                        </View>
                        <ArrowLeft color="white" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Calendar date picker — confirms then navigates to payment */}
            <SubscribeSheet
                visible={!!subscribeProduct}
                onClose={() => setSubscribeProduct(null)}
                product={subscribeProduct}
                onBuyOnce={(p: SubscribeProduct) => {
                    addItem({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        unit: p.unit,
                    });
                }}
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
