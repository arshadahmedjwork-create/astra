import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, ChevronLeft, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ERPLayout from '@/components/erp/ERPLayout';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Checkout = () => {
    const { items, clearCart } = useCartStore();
    const { customer } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = async () => {
        if (!customer) {
            toast({ title: 'Please login', description: 'You must be logged in to place an order.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    customer_id: customer.id,
                    total_amount: total,
                    status: 'pending',
                    delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Next day
                    payment_status: 'pending',
                    payment_method: paymentMethod
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Success
            setConfirmed(true);
            clearCart();
            toast({ title: 'Order Placed! 🎉', description: 'Your fresh dairy products are on the way.' });
        } catch (error: any) {
            toast({ title: 'Order Failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (confirmed) {
        return (
            <ERPLayout>
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-3xl border border-border p-12 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
                        <p className="text-muted-foreground mb-8">
                            Thank you for your order. We'll deliver your items by tomorrow morning.
                        </p>
                        <Link to="/erp/dashboard">
                            <Button className="forest-gradient px-8 py-6 rounded-2xl font-bold text-lg">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </ERPLayout>
        );
    }

    if (items.length === 0) {
        return (
            <ERPLayout>
                <div className="max-w-4xl mx-auto text-center py-20">
                    <h1 className="text-2xl font-bold">Your cart is empty</h1>
                    <Link to="/erp/products" className="mt-4 inline-block text-primary">Browse Products</Link>
                </div>
            </ERPLayout>
        );
    }

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto">
                <Link to="/erp/cart" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Cart
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-foreground">
                    <div className="space-y-8">
                        {/* Section: Delivery Details */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Delivery Address</h2>
                            </div>
                            
                            {customer ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                                        <p className="font-bold">{customer.full_name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {customer.address ? (
                                                `${customer.address.door_no ? customer.address.door_no + ', ' : ''}${customer.address.street ? customer.address.street + ', ' : ''}${customer.address.area ? customer.address.area + ', ' : ''}${customer.address.city}, ${customer.address.state} - ${customer.address.pincode}`
                                            ) : 'No address provided'}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{customer.mobile}</p>
                                    </div>
                                    <Link to="/erp/profile" className="text-sm text-primary font-medium hover:underline">
                                        Change Address
                                    </Link>
                                </div>
                            ) : (
                                <p>Please login to set delivery address.</p>
                            )}
                        </section>

                        {/* Section: Payment Method */}
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold">Payment Method</h2>
                            </div>

                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Label
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-secondary/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="cod" id="cod" className="sr-only" />
                                        <div>
                                            <p className="font-bold">Cash on Delivery</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Pay when you receive</p>
                                        </div>
                                    </div>
                                </Label>
                                <Label
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-not-allowed opacity-60 ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="online" id="online" disabled className="sr-only" />
                                        <div>
                                            <p className="font-bold">Online Payment</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Wait for next update</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full font-bold">SOON</span>
                                </Label>
                            </RadioGroup>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:static lg:h-fit">
                        <section className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 bg-secondary/30 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold truncate">{item.name}</p>
                                                <p className="text-muted-foreground px-0.5">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold whitespace-nowrap ml-4">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-border mb-8">
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
                                    <span className="font-bold">Grand Total</span>
                                    <span className="text-2xl font-black text-primary">₹{total}</span>
                                </div>
                            </div>

                            <Button 
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full forest-gradient py-7 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                                ) : (
                                    <>Confirm Order</>
                                )}
                            </Button>
                            
                            <p className="text-[10px] text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Next delivery window: 5:00 AM - 7:30 AM Tomorrow
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default Checkout;
