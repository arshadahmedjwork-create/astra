import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { supabase } from '../lib/supabase';
import { ChevronLeft, MapPin, Ticket, Calendar, CheckCircle2 } from 'lucide-react-native';

export default function CheckoutScreen({ navigation }: any) {
    const { customer } = useAuthStore();
    const { items, total, clearCart } = useCartStore((state) => ({
        items: state.items,
        total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        clearCart: state.clearCart
    }));

    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const finalTotal = Math.max(0, total - discount);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === 'ASTRA10') {
            const d = total * 1;
            setDiscount(d);
            Alert.alert('Success', '100% Discount applied!');
        } else {
            setDiscount(0);
            Alert.alert('Invalid', 'Check your promo code and try again.');
        }
    };

    const sendOrderEmail = async (orderId: string, orderTotal: number) => {
        try {
            const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
            const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ORDER_CONFORMED;
            const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
            const privateKey = process.env.EXPO_PUBLIC_EMAILJS_PRIVATE_KEY || 'B-pA-TsJX7iKnpsiXHtJH';

            if (!serviceId || !templateId || !publicKey || !privateKey) {
                console.error('EmailJS credentials missing:', {
                    serviceId: !!serviceId,
                    templateId: !!templateId,
                    publicKey: !!publicKey,
                    privateKey: !!privateKey
                });
                return;
            }

            const productDetails = items.map(item => `${item.name} (${item.quantity} x ₹${item.price})`).join('\n');

            const emailData = {
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: {
                    to_name: customer?.full_name || 'Customer',
                    to_email: customer?.email || '',
                    order_id: orderId,
                    order_total: orderTotal.toString(),
                    delivery_date: deliveryDate.toLocaleDateString(),
                    product_details: productDetails,
                    message: "Your order has been confirmed and is scheduled for delivery."
                },
            };

            console.log('Sending EmailJS Request (params only):', {
                service_id: emailData.service_id,
                template_id: emailData.template_id,
                user_id: emailData.user_id,
                has_accessToken: !!emailData.accessToken,
                template_params: emailData.template_params
            });

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const resultText = await response.text();
            console.log('EmailJS Response:', response.status, resultText);

            if (!response.ok) {
                console.error('EmailJS Error:', resultText);
            }
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
        }
    };

    const handlePlaceOrder = async () => {
        if (!customer) return;
        setLoading(true);

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_id: customer.id,
                    total_amount: finalTotal,
                    status: 'pending',
                    delivery_date: deliveryDate.toISOString().split('T')[0],
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Send Confirmation Email
            await sendOrderEmail(order.id, finalTotal);

            setOrderPlaced(true);
            clearCart();
        } catch (error: any) {
            Alert.alert('Order Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center px-10">
                <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                    <CheckCircle2 color="#22c55e" size={64} />
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center">Order Confirmed!</Text>
                <Text className="text-gray-500 text-center mt-3 leading-6">
                    Thank you for choosing Astra Dairy. Your order has been placed and will be delivered on {formattedDate}.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Dashboard')}
                    className="bg-[#1B4D3E] w-full py-4 rounded-2xl mt-12 shadow-md"
                >
                    <Text className="text-white font-bold text-center text-lg">Back to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center border-b border-gray-100 shadow-sm">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeft color="#1B4D3E" size={28} />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-2 text-[#1B4D3E]">Checkout</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Delivery Address */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <MapPin color="#1B4D3E" size={20} />
                            <Text className="ml-2 font-bold text-gray-900">Delivery Address</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Text className="text-[#D4AF37] font-bold text-sm">Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-gray-700 leading-6">
                        {customer?.address?.door_no}, {customer?.address?.street}{"\n"}
                        {customer?.address?.landmark && `${customer?.address?.landmark}, `}
                        {customer?.address?.area}, {customer?.address?.city}{"\n"}
                        {customer?.address?.pincode}
                    </Text>
                </View>

                {/* Delivery Date */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Calendar color="#1B4D3E" size={20} />
                        <Text className="ml-2 font-bold text-gray-900">Estimated Delivery</Text>
                    </View>
                    <Text className="text-[#1B4D3E] font-medium text-lg">{formattedDate}</Text>
                    <Text className="text-gray-400 text-xs mt-1">Orders placed now will be delivered tomorrow morning.</Text>
                </View>

                {/* Promo Code */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Ticket color="#1B4D3E" size={20} />
                        <Text className="ml-2 font-bold text-gray-900">Promo Code</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900"
                            placeholder="Enter Code (e.g. ASTRA10)"
                            value={promoCode}
                            onChangeText={setPromoCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            onPress={handleApplyPromo}
                            className="bg-[#D4AF37] px-6 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white font-bold">Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary */}
                <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-10">
                    <Text className="font-bold text-gray-900 mb-4">Order Summary</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Subtotal</Text>
                            <Text className="text-gray-900 font-medium">₹{total}</Text>
                        </View>
                        {discount > 0 && (
                            <View className="flex-row justify-between">
                                <Text className="text-green-600">Discount (10%)</Text>
                                <Text className="text-green-600 font-medium">-₹{discount}</Text>
                            </View>
                        )}
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Delivery Fee</Text>
                            <Text className="text-green-600 font-medium">FREE</Text>
                        </View>
                        <View className="h-[1px] bg-gray-100 my-2" />
                        <View className="flex-row justify-between">
                            <Text className="text-lg font-bold text-gray-900">Total</Text>
                            <Text className="text-lg font-bold text-[#1B4D3E]">₹{finalTotal}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="bg-white p-6 border-t border-gray-100">
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={loading}
                    className="bg-[#1B4D3E] h-16 rounded-2xl items-center justify-center shadow-lg"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Place Order • ₹{finalTotal}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
