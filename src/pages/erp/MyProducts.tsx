import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ERPLayout from '@/components/erp/ERPLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
    'Cow Milk': '/src/assets/product-raw-milk.png',
    'Buffalo Milk': '/src/assets/product-pasteurized-milk.png',
    'A2 Milk': '/src/assets/product-homogenized-milk.png',
    'Paneer': '/src/assets/product-paneer.png',
    'Ghee': '/src/assets/product-ghee.png',
    'Curd': '/src/assets/product-curd.png',
    'Buttermilk': '/src/assets/product-buttermilk.png',
    'Flavoured Milk': '/src/assets/product-chocolate-milk.png',
    'Natural Kulfi': '/src/assets/product-kulfi.png',
};

const MyProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('category');

            if (data) {
                setProducts(data);
                const initialQty: Record<string, number> = {};
                data.forEach(p => { initialQty[p.id] = 1; });
                setQuantities(initialQty);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const updateQuantity = (id: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta),
        }));
    };

    const handleAddToCart = (product: Product) => {
        toast({
            title: 'Added to subscription!',
            description: `${quantities[product.id]}x ${product.name} added. Go to "Renew Subscription" to complete.`,
        });
    };

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
                        Browse and add products to your subscription
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
                                <div className="aspect-square bg-sage/20 overflow-hidden relative">
                                    <img
                                        src={productImages[product.name] || '/src/assets/product-raw-milk.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-card/90 backdrop-blur-sm text-xs font-semibold text-accent px-2.5 py-1 rounded-full border border-border">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <span className="text-xl font-bold text-primary">₹{product.price}</span>
                                            <span className="text-xs text-muted-foreground ml-1">/ {product.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="flex items-center border border-border rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => updateQuantity(product.id, -1)}
                                                className="px-3 py-2 hover:bg-secondary transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">
                                                {quantities[product.id] || 1}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(product.id, 1)}
                                                className="px-3 py-2 hover:bg-secondary transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            className="flex-1 forest-gradient text-primary-foreground rounded-xl h-10 font-semibold text-sm"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </ERPLayout>
    );
};

export default MyProducts;
