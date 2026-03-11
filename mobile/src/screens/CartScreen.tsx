import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { useCartStore } from '../stores/cartStore';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';

const PRODUCT_IMAGES: Record<string, any> = {
    'Cow Milk': require('../../assets/product-raw-milk.png'),
    'Buffalo Milk': require('../../assets/product-raw-milk.png'),
    'A2 Milk': require('../../assets/product-raw-milk.png'),
    'Paneer': require('../../assets/product-paneer.png'),
    'Ghee': require('../../assets/product-ghee.png'),
    'Curd': require('../../assets/product-curd.png'),
    'Buttermilk': require('../../assets/product-buttermilk.png'),
    'Flavoured Milk': require('../../assets/product-chocolate-milk.png'),
    'Natural Kulfi': require('../../assets/product-kulfi.png'),
    'Carrot Milk': require('../../assets/product-carrot-milk.png'),
    'Coconut Oil': require('../../assets/product-coconut-oil.png'),
    'Sesame Oil': require('../../assets/product-sesame-oil.png'),
    'Homogenized Milk': require('../../assets/product-homogenized-milk.png'),
    'Pasteurized Milk': require('../../assets/product-pasteurized-milk.png'),
};

export default function CartScreen({ navigation }: any) {
    const { items, updateQuantity, removeItem, clearCart } = useCartStore();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (items.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="#1B4D3E" size={28} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-2 text-[#1B4D3E]">My Cart</Text>
                </View>
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                        <ShoppingBag color="#cbd5e1" size={48} />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 text-center">Your cart is empty</Text>
                    <Text className="text-gray-500 text-center mt-2 leading-6">Looks like you haven't added anything to your cart yet.</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Products')}
                        className="bg-[#1B4D3E] px-8 py-4 rounded-2xl mt-8 shadow-md"
                    >
                        <Text className="text-white font-bold text-lg">Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="#1B4D3E" size={28} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-2 text-[#1B4D3E]">My Cart</Text>
                </View>
                <TouchableOpacity onPress={clearCart}>
                    <Text className="text-red-500 font-medium">Clear All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                {items.map((item) => (
                    <View key={item.id} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-100 flex-row">
                        <View className="w-24 h-24 bg-[#8FBC8F]/10 rounded-2xl items-center justify-center overflow-hidden">
                            <Image
                                source={PRODUCT_IMAGES[item.name] || require('../../assets/logo.png')}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="flex-1 ml-4 justify-between">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-gray-500 text-xs">₹{item.price} / {item.unit || 'unit'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
                                    <Trash2 color="#ef4444" size={18} />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center justify-between mt-2">
                                <Text className="font-bold text-[#1B4D3E] text-lg">₹{item.price * item.quantity}</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-2"
                                    >
                                        <Minus color="#1B4D3E" size={16} />
                                    </TouchableOpacity>
                                    <Text className="font-bold text-[#1B4D3E] mx-3 text-base">{item.quantity}</Text>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-2"
                                    >
                                        <Plus color="#1B4D3E" size={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
                <View className="h-20" />
            </ScrollView>

            <View className="bg-white p-6 rounded-t-[32px] shadow-2xl border-t border-gray-100">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-500 text-sm">Total Amount</Text>
                        <Text className="text-2xl font-bold text-[#1B4D3E]">₹{total}</Text>
                    </View>
                    <View className="bg-[#D4AF37]/10 px-4 py-2 rounded-full">
                        <Text className="text-[#D4AF37] font-bold">{items.length} Items</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Checkout')}
                    className="bg-[#1B4D3E] h-16 rounded-2xl items-center justify-center shadow-lg"
                >
                    <Text className="text-white font-bold text-lg">Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
