import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ERPLayout from '@/components/erp/ERPLayout';
import { useCartStore } from '@/stores/useCartStore';

const Cart = () => {
    const { items, updateQuantity, removeItem, clearCart } = useCartStore();
    const navigate = useNavigate();

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <ERPLayout>
                <div className="max-w-4xl mx-auto text-center py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-3xl border border-border p-12 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
                        <p className="text-muted-foreground mb-8 text-balance">
                            Looks like you haven't added any dairy goodness to your cart yet.
                        </p>
                        <Link to="/erp/products">
                            <Button className="forest-gradient px-8 py-6 rounded-2xl font-bold text-lg">
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Browse Products
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </ERPLayout>
        );
    }

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                            <ShoppingCart className="w-7 h-7 text-primary" />
                            Shopping Cart
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Review your items before checkout
                        </p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearCart}
                        className="text-destructive hover:bg-destructive/10"
                    >
                        Clear Cart
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card rounded-2xl border border-border p-4 sm:p-5 flex gap-4 sm:gap-6 items-center"
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary/30 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg leading-tight truncate">{item.name}</h3>
                                    <p className="text-primary font-bold mt-1">₹{item.price}</p>
                                    
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center border border-border rounded-lg overflow-hidden h-9">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2.5 hover:bg-secondary transition-colors"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="px-3 text-sm font-semibold min-w-[32px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2.5 hover:bg-secondary transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-lg font-bold">₹{item.price * item.quantity}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                </div>
                                {deliveryFee > 0 && (
                                    <p className="text-[10px] text-accent font-medium leading-tight">
                                        Add ₹{500 - subtotal} more for FREE delivery
                                    </p>
                                )}
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="text-2xl font-black text-primary">₹{total}</span>
                                </div>
                            </div>

                            <Button 
                                onClick={() => navigate('/erp/checkout')}
                                className="w-full forest-gradient py-6 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                            >
                                Checkout
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            
                            <p className="text-[10px] text-center text-muted-foreground mt-4">
                                Taxes calculated at checkout. Secure SSL encrypted payment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default Cart;
