import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ChevronRight, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useCallback } from 'react';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
        name: string;
    } | null;
}

interface Order {
    id: string;
    order_date: string;
    delivery_date: string;
    status: 'pending' | 'get_to_deliver' | 'delivered' | 'paused' | 'cancelled';
    total_amount: number;
    order_items: OrderItem[];
}

const OrderHistory = () => {
    const { customer } = useAuthStore();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer) {
            fetchOrders();
        }
    }, [customer, fetchOrders]);

    const fetchOrders = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (name)
                    )
                `)
                .eq('customer_id', customer?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            const err = error as Error;
            toast({
                title: 'Error fetching orders',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [customer?.id, toast]);

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
            case 'get_to_deliver': return <Truck className="w-4 h-4 text-primary" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'get_to_deliver': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            case 'paused': return 'Paused';
            default: return 'Pending';
        }
    };

    return (
        <ERPLayout>
            <div className="max-w-4xl mx-auto text-foreground">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Order History</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your recent orders and delivery status
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-secondary/20 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border border-border">
                        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground">No orders yet</h2>
                        <p className="text-muted-foreground mb-8">Start shopping for fresh dairy products!</p>
                        <Link to="/erp/products">
                            <Button className="forest-gradient">Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order Date</p>
                                            <p className="font-bold flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                {format(new Date(order.order_date), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount</p>
                                            <p className="font-bold text-lg text-primary">₹{order.total_amount}</p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold ring-1 ${
                                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                                            order.status === 'cancelled' ? 'bg-destructive/10 text-destructive ring-destructive/20' :
                                            'bg-amber-50 text-amber-700 ring-amber-200'
                                        }`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-border flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        {order.order_items.map((item, idx) => (
                                            <span key={item.id}>
                                                {item.quantity}x {item.products?.name}{idx < order.order_items.length - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <Link to={`/erp/track/${order.id}`}>
                                             <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                                 <Truck className="w-4 h-4 mr-2" />
                                                 Track Order
                                             </Button>
                                         </Link>
                                        <Link to={`/erp/orders/${order.id}`}>
                                            <Button variant="ghost" size="sm" className="group-hover:text-primary">
                                                Details <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
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

export default OrderHistory;
