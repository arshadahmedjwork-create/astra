import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ERPLayout from '@/components/erp/ERPLayout';
import { supabase } from '@/lib/supabase';
import SubscribeModal, { type SubscribeModalProduct } from '@/components/erp/SubscribeModal';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
    is_sample: boolean;
}

const productImages: Record<string, string> = {
    'Cow Milk': '/assets/product-raw-milk.png',
    'Buffalo Milk': '/assets/product-pasteurized-milk.png',
    'A2 Milk': '/assets/product-homogenized-milk.png',
    'Paneer': '/assets/product-paneer.png',
    'Ghee': '/assets/product-ghee.png',
    'Curd': '/assets/product-curd.png',
    'Buttermilk': '/assets/product-buttermilk.png',
    'Flavoured Milk': '/assets/product-chocolate-milk.png',
    'Natural Kulfi': '/assets/product-kulfi.png',
};

const MyProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribeProduct, setSubscribeProduct] = useState<SubscribeModalProduct | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('category');

            if (data) setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                        <ShoppingBag className="w-7 h-7 text-primary" />
                        My Products
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Subscribe to recurring deliveries for your favourite products
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group"
                            >
                                {/* Product image */}
                                <div className="aspect-square bg-sage/20 overflow-hidden relative">
                                    <img
                                        src={productImages[product.name] || '/assets/product-raw-milk.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-card/90 backdrop-blur-sm text-xs font-semibold text-accent px-2.5 py-1 rounded-full border border-border">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-5">
                                    <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <span className="text-xl font-bold text-primary">₹{product.price}</span>
                                            <span className="text-xs text-muted-foreground ml-1">/ {product.unit}</span>
                                        </div>
                                    </div>

                                    {/* Single Subscribe CTA */}
                                    <Button
                                        onClick={() => setSubscribeProduct({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            unit: product.unit,
                                        })}
                                        className="w-full mt-5 h-11 rounded-xl font-black text-sm forest-gradient shadow-md shadow-primary/20 gap-2"
                                    >
                                        <Repeat className="w-4 h-4" />
                                        Subscribe / Pre-Order
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Subscribe Modal */}
            <SubscribeModal
                open={!!subscribeProduct}
                onClose={() => setSubscribeProduct(null)}
                product={subscribeProduct}
                onSuccess={() => setSubscribeProduct(null)}
            />
        </ERPLayout>
    );
};

export default MyProducts;
