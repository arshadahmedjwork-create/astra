import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, X } from 'lucide-react-native';
import { useCartStore } from '../stores/cartStore';

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

function ProductItem({ product, onAdd }: { product: Product, onAdd: (p: Product) => void }) {
    const isInCart = useCartStore((state) => state.isInCart(product.id));

    return (
        <View className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex-row">
            <View className="w-32 h-32 bg-[#8FBC8F]/20 items-center justify-center">
                <Image
                    source={PRODUCT_IMAGES[product.name] || require('../../assets/logo.png')}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>
            <View className="flex-1 p-4 justify-between">
                <View>
                    <View className="flex-row justify-between items-start">
                        <Text className="font-bold text-gray-900 text-lg flex-1 mr-2">{product.name}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{product.description}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-baseline">
                        <Text className="font-bold text-[#1B4D3E] text-lg">₹{product.price}</Text>
                        <Text className="text-[10px] text-gray-500 font-normal ml-1">/{product.unit}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => onAdd(product)}
                        className={`w-10 h-10 rounded-full items-center justify-center ${isInCart ? 'bg-green-500' : 'bg-[#1B4D3E]'}`}
                    >
                        {isInCart ? <Check color="white" size={20} /> : <Plus color="white" size={20} />}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default function ProductsScreen({ navigation }: any) {
    const { items, addItem } = useCartStore((state) => ({
        items: state.items,
        addItem: state.addItem
    }));
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);

    const cartItemsCount = items.length;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('category');

        if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            addItem(selectedProduct, quantity);
            setSelectedProduct(null);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-[#1B4D3E] pt-16 pb-4 px-6 shadow-md flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Products</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Cart')}
                    className="p-2 relative"
                >
                    <ShoppingCart color="white" size={24} />
                    {cartItemsCount > 0 && (
                        <View className="absolute -top-0 -right-0 bg-[#D4AF37] min-w-[16px] h-[16px] rounded-full items-center justify-center px-1">
                            <Text className="text-[8px] font-bold text-[#1B4D3E]">{cartItemsCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-4 pb-20">
                {loading ? (
                    <ActivityIndicator size="large" color="#1B4D3E" className="mt-10" />
                ) : (
                    <View className="gap-4 pb-12">
                        {products.map((product) => (
                            <ProductItem key={product.id} product={product} onAdd={handleOpenModal} />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Quantity Modal */}
            <Modal
                visible={!!selectedProduct}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedProduct(null)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center px-10"
                    onPress={() => setSelectedProduct(null)}
                >
                    <Pressable
                        className="bg-white w-full rounded-[32px] p-6 shadow-2xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Select Quantity</Text>
                            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                                <X color="#64748b" size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedProduct && (
                            <View className="items-center mb-8">
                                <View className="w-24 h-24 bg-[#8FBC8F]/10 rounded-2xl items-center justify-center overflow-hidden mb-4">
                                    <Image
                                        source={PRODUCT_IMAGES[selectedProduct.name] || require('../../assets/logo.png')}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text className="text-lg font-bold text-[#1B4D3E] text-center">{selectedProduct.name}</Text>
                                <Text className="text-gray-500 mt-1">₹{selectedProduct.price} / {selectedProduct.unit}</Text>
                            </View>
                        )}

                        <View className="flex-row items-center justify-center bg-gray-50 rounded-2xl py-4 mb-8">
                            <TouchableOpacity
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 bg-white border border-gray-100 rounded-xl items-center justify-center shadow-sm"
                            >
                                <Minus color="#1B4D3E" size={20} />
                            </TouchableOpacity>
                            <View className="mx-8 items-center">
                                <Text className="text-3xl font-bold text-[#1B4D3E]">{quantity}</Text>
                                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-1">Items</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 bg-white border border-gray-100 rounded-xl items-center justify-center shadow-sm"
                            >
                                <Plus color="#1B4D3E" size={20} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleAddToCart}
                            className="bg-[#1B4D3E] h-14 rounded-2xl items-center justify-center shadow-lg"
                        >
                            <Text className="text-white font-bold text-lg">Add to Cart • ₹{selectedProduct ? selectedProduct.price * quantity : 0}</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}


